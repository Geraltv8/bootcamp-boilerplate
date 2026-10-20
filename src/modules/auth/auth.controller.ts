import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario, { Rol } from './Usuario.model.js';
import Paciente from '../pacientes/Paciente.model.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';
import { ObraSocial } from '../pacientes/types/PacienteObraSocial.enum.js';
import { TipoTelefono } from '../pacientes/types/PacienteTelefono.enum.js';

const firmarToken = (payload: { id: string; user: string; rol: Rol; activo: boolean }): string => {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return jwt.sign(payload, secreto, { expiresIn: '8h' });
};

export const registrarUsuario = async (req: Request, res: Response) => {
    try {
        const { email, user, password, rol } = req.body as {
            email?: string;
            user?: string;
            password?: string;
            rol?: Rol;
        };

        if (!email || !user || !password || !rol) {
            return respuestaEstandar(res, 400, false, 'Email, usuario, contraseña y rol son obligatorios');
        }

        const existeUsuario = await Usuario.findOne({ $or: [{ email }, { user }] });
        if (existeUsuario) {
            return respuestaEstandar(res, 400, false, 'El mail o el usuario ya están registrados');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const nuevoUsuario = await Usuario.create({
            email,
            user,
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

export const loginUsuario = async (req: Request, res: Response) => {
    try {
        const { email, user, password } = req.body as {
            email?: string;
            user?: string;
            password?: string;
        };

        if (!email || !user || !password) {
            return respuestaEstandar(res, 400, false, 'Email, usuario y contraseña son obligatorios');
        }

        const usuario = await Usuario.findOne({ email, user, activo: true });
        if (!usuario) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const token = firmarToken({
            id: String(usuario._id),
            user: usuario.user,
            rol: usuario.rol,
            activo: usuario.activo,
        });

        return respuestaEstandar(res, 200, true, 'login exitoso', { token });
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'error del servidor', obtenerMensajeError(error));
    }
};

export const loginCiudadano = async (req: Request, res: Response) => {
    try {
        const { dni, telefono } = req.body as { dni?: string; telefono?: string };

        if (!dni || !telefono) {
            return respuestaEstandar(res, 400, false, 'DNI y teléfono son obligatorios');
        }

        const numeroTelefono = telefono.replace(/\D/g, '');
        const pacientePorDni = await Paciente.findOne({ dni: dni.trim() });

        if (pacientePorDni && pacientePorDni.telefono.numero !== numeroTelefono) {
            return respuestaEstandar(res, 401, false, 'Las credenciales ingresadas no coinciden con el paciente registrado');
        }

        let paciente = pacientePorDni ?? (await Paciente.findOne({
            dni: dni.trim(),
            'telefono.numero': numeroTelefono,
        }));

        if (!paciente) {
            paciente = await Paciente.create({
                nombre: 'PACIENTE',
                dni: dni.trim(),
                direccion: {
                    calle: 'Sin información',
                    numero: 'S/N',
                    piso: '',
                    departamento: '',
                    barrio: 'Sin información',
                },
                email: `${dni.trim()}@autogenerado.local`,
                telefono: {
                    tipo: TipoTelefono.CELULAR,
                    codigoArea: '11',
                    numero: numeroTelefono,
                },
                obraSocial: {
                    nombre: ObraSocial.NINGUNA,
                    numeroAfiliado: '',
                },
                historialMedico: {
                    fecha: new Date(),
                    diagnostico: 'Registro automático del sistema',
                    tratamiento: 'Sin detalle',
                    medico: 'Sistema',
                },
            });
        }

        const token = firmarToken({
            id: String(paciente._id),
            user: paciente.dni,
            rol: Rol.PACIENTE,
            activo: true,
        });

        return respuestaEstandar(res, 200, true, 'login exitoso', { token, paciente });
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'error del servidor', obtenerMensajeError(error));
    }
};
