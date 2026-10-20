import type { Request, Response } from 'express';
import Consultorio from './Consultorio.model.js';
import type { ICrearConsultorioDTO, IQueryConsultorios } from './dtos/Consultorio.schema.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';
import Especialidad from '../especialidades/Especialidad.model.js';
import type { IActualizarConsultorioDTO } from './dtos/Consultorio.schema.js';

const getConsultorios = async (
    req: Request<unknown, unknown, unknown, IQueryConsultorios>,
    res: Response,
) => {
    try {
        const { especialidad, activo } = req.query;
        const filtro: Record<string, boolean | string> = {};

        if (especialidad) filtro.especialidad = especialidad.toLowerCase();
        if (req.usuario?.rol === 'ADMIN' && activo !== undefined) filtro.activo = activo === 'true';
        else filtro.activo = true;

        const consultorios = await Consultorio.find(filtro);
        return respuestaEstandar(res, 200, true, 'Consultorios obtenidos exitosamente', consultorios);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los consultorios', obtenerMensajeError(error));
    }
};

const createConsultorio = async (
    req: Request<unknown, unknown, ICrearConsultorioDTO>,
    res: Response,
) => {
    try {
        const especialidad = await Especialidad.findOne({ codigo: req.body.especialidad, activo: true });
        if (!especialidad) return respuestaEstandar(res, 400, false, 'La especialidad no existe o está inactiva');
        const nuevoConsultorio = await Consultorio.create(req.body);
        return respuestaEstandar(res, 201, true, 'Consultorio creado exitosamente', nuevoConsultorio);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'Ya existe un consultorio con ese nombre');
        }
        return respuestaEstandar(res, 500, false, 'Error al crear el consultorio', obtenerMensajeError(error));
    }
};

const updateConsultorio = async (
    req: Request<{ id: string }, unknown, IActualizarConsultorioDTO>,
    res: Response,
) => {
    try {
        if (req.body.especialidad) {
            const especialidad = await Especialidad.findOne({ codigo: req.body.especialidad, activo: true });
            if (!especialidad) return respuestaEstandar(res, 400, false, 'La especialidad no existe o está inactiva');
        }
        const consultorio = await Consultorio.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!consultorio) return respuestaEstandar(res, 404, false, 'Consultorio no encontrado');
        return respuestaEstandar(res, 200, true, 'Consultorio actualizado exitosamente', consultorio);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'Ya existe un consultorio con ese nombre');
        }
        return respuestaEstandar(res, 400, false, 'Error al actualizar el consultorio', obtenerMensajeError(error));
    }
};

const deleteConsultorio = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const consultorioBorrado = await Consultorio.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true },
        );

        if (!consultorioBorrado) {
            return respuestaEstandar(res, 404, false, 'Consultorio no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Consultorio eliminado correctamente', consultorioBorrado);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el consultorio', obtenerMensajeError(error));
    }
};

export { getConsultorios, createConsultorio, updateConsultorio, deleteConsultorio };
