import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario, { Rol } from './Usuario.model.js';
import Paciente from '../pacientes/Paciente.model.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';
import { TipoTelefono } from '../pacientes/types/PacienteTelefono.enum.js';
import type { ILoginPersonalDTO, ILoginCiudadanoDTO, IRegistrarUsuarioDTO } from './dtos/Auth.schema.js';

const firmarToken = (payload: { id: string; user: string; rol: Rol; activo: boolean }): string => {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return jwt.sign(payload, secreto, { expiresIn: '8h' });
};

export const registrarUsuario = async (req: Request<unknown, unknown, IRegistrarUsuarioDTO>, res: Response) => {
    try {
        const { email, user, password, rol } = req.body;

        const existeUsuario = await Usuario.findOne({
            $or: [{ email }, ...(user ? [{ user }] : [])],
        });
        if (existeUsuario) {
            return respuestaEstandar(res, 400, false, 'El mail o el usuario ya están registrados');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const nuevoUsuario = await Usuario.create({
            email,
            ...(user ? { user } : {}),
            password: passwordHash,
            rol,
        });

        return respuestaEstandar(res, 201, true, 'Usuario creado', {
            id: nuevoUsuario._id,
            email: nuevoUsuario.email,
            user: nuevoUsuario.user,
            rol: nuevoUsuario.rol,
        });
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'error del servidor', obtenerMensajeError(error));
    }
};

export const loginUsuario = async (req: Request<unknown, unknown, ILoginPersonalDTO>, res: Response) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email, activo: true });
        if (!usuario) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const token = firmarToken({
            id: String(usuario._id),
            user: usuario.user ?? usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
        });

        return respuestaEstandar(res, 200, true, 'login exitoso', { token });
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'error del servidor', obtenerMensajeError(error));
    }
};

export const loginCiudadano = async (req: Request<unknown, unknown, ILoginCiudadanoDTO>, res: Response) => {
    try {
        const { dni, telefono } = req.body;

        const numeroTelefono = telefono.replace(/\D/g, '');
        const pacientePorDni = await Paciente.findOne({ dni: dni.trim() });
        if (pacientePorDni && !pacientePorDni.activo) {
            return respuestaEstandar(res, 401, false, 'Las credenciales ingresadas no coinciden con el paciente registrado');
        }

        const telefonoRegistrado = pacientePorDni
            ? `${pacientePorDni.telefono.codigoArea ?? ''}${pacientePorDni.telefono.numero}`.replace(/\D/g, '')
            : '';
        const telefonoCoincide = pacientePorDni && (
            pacientePorDni.telefono.numero.replace(/\D/g, '') === numeroTelefono
            || telefonoRegistrado === numeroTelefono
            || (numeroTelefono.length >= 10 && telefonoRegistrado.endsWith(numeroTelefono.slice(-10)))
        );
        if (pacientePorDni && !telefonoCoincide) {
            return respuestaEstandar(res, 401, false, 'Las credenciales ingresadas no coinciden con el paciente registrado');
        }

        let paciente = pacientePorDni;

        if (!paciente) {
            paciente = await Paciente.create({
                dni: dni.trim(),
                telefono: {
                    tipo: TipoTelefono.CELULAR,
                    codigoArea: '',
                    numero: numeroTelefono,
                },
            });
        }

        const token = firmarToken({
            id: String(paciente._id),
            user: paciente.dni,
            rol: Rol.PACIENTE,
            activo: true,
        });

        return respuestaEstandar(res, 200, true, 'login exitoso', {
            token,
            paciente: { id: paciente._id, dni: paciente.dni, nombre: paciente.nombre },
        });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'El DNI ya tiene una cuenta registrada');
        }
        return respuestaEstandar(res, 500, false, 'error del servidor', obtenerMensajeError(error));
    }
};
