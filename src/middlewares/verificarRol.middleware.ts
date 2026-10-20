import type { Request, Response, NextFunction } from 'express';
import { respuestaEstandar } from '../utils/respuestaEstandar.js';
import type { Rol } from '../modules/auth/Usuario.model.js';

export const verificarRol = (...rolesPermitidos: Rol[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.usuario) {
            respuestaEstandar(res, 500, false, 'se intento verificar el rol, sin validar primero el token');
            return;
        }

        if (!req.usuario.activo) {
            respuestaEstandar(res, 403, false, 'El usuario esta deshabilitado');
            return;
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            respuestaEstandar(res, 403, false, 'acceso denegado, no tiene el rol correcto');
            return;
        }

        next();
    };
};