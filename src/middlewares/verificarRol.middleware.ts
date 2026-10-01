import type { Request, Response, NextFunction } from 'express';
import { respuestaEstandar } from '../utils/respuestaEstandar';;

export const verificarRol = (...rolesPermitidos: string[]) => {

    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.usuario) {
            return respuestaEstandar(res, 500, false, 'se intento verificar el rol, sin validar primero el token');
        }

        if (!req.usuario.activo) {
            return respuestaEstandar(res, 403, false, 'El usuario esta deshabilitado');
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return respuestaEstandar(res, 403, false, 'acceso denegado, no tiene el rol correcto');
        }

        next();
    };
};