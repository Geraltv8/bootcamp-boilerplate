import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import Usuario from './Usuario.model';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import jwt from 'jsonwebtoken';

export const registrarUsuario = async (req: Request, res: Response) => {
    try {
        const { email, user, password, rol } = req.body;

        const existeUsuario = await Usuario.findOne({ email, user});
        if (existeUsuario) {
            return respuestaEstandar(res, 400, false, 'el mail o el usuario ya estan registrados')
        }

        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(password, salt)

        const nuevoUsuario = await Usuario.create({
            email,
            user,
            password: passwordHash,
            rol
        })

        return respuestaEstandar(
            res, 
            201, 
            true, 
            'Usuario creado', { 
                id: nuevoUsuario._id, 
                email: nuevoUsuario.email, 
                user: nuevoUsuario.user
            });

    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'error del servidor', error.message);
    }
};

export const loginUsuario = async (req: Request, res: Response) => {
    try {

        const { email, user, password } = req.body;

        const usuario = await Usuario.findOne({ email, user, activo: true });
        if (!usuario) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return respuestaEstandar(res, 401, false, 'Credenciales invalidas');
        }

        const payload = {
            id: usuario._id,
            user: usuario.user,
            rol: usuario.rol,
            activo: usuario.activo
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        return respuestaEstandar(res, 200, true, 'login exitoso', { token });
    } catch (error: any) {
         return respuestaEstandar(res, 500, false, 'error del servidor', error.message);
    }
}