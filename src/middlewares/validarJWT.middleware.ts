import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { respuestaEstandar } from '../utils/respuestaEstandar.js';
import { Rol } from '../modules/auth/Usuario.model.js';

interface TokenPayload {
    id: string;
    user: string;
    rol: Rol;
    activo: boolean;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload;
        }
    }
}

export const validarJWT = (req: Request, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization;

    if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
        respuestaEstandar(res, 401, false, 'No hay token en la peticion');
        return;
    }

    const token = headerAuth.split(' ')[1] as string;

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        req.usuario = decodificado;
        next();
    } catch {
        respuestaEstandar(res, 401, false, 'Token invalido o expirado');
    }
};
