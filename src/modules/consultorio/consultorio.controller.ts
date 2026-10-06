import type { Request, Response } from 'express';
import Consultorio from './Consultorio.model';
import type { ICrearConsultorioDTO, IQueryConsultorios } from './dtos/Consultorio.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

const getConsultorios = async (req: Request<unknown, unknown, unknown, IQueryConsultorios>, res: Response) => {
    try {
        const { especialidad, activo } = req.query;
        const filtro: Record<string, boolean | string> = {};

        if (especialidad) filtro.especialidad = especialidad.toUpperCase();
        if (activo !== undefined) filtro.activo = activo === 'true';

        const consultorios = await Consultorio.find(filtro);

        return respuestaEstandar(res, 200, true, 'Consultorios obtenidos exitosamente', consultorios);
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : 'Error al obtener los consultorios';
        return respuestaEstandar(res, 500, false, 'Error al obtener los consultorios', mensaje);
    }
};

const createConsultorio = async (req: Request<unknown, unknown, ICrearConsultorioDTO>, res: Response) => {
    try {
        const nuevoConsultorio = await Consultorio.create(req.body);

        return respuestaEstandar(res, 201, true, 'Consultorio creado exitosamente', nuevoConsultorio);
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : 'Error al crear el consultorio';
        return respuestaEstandar(res, 500, false, 'Error al crear el consultorio', mensaje);
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
        const mensaje = error instanceof Error ? error.message : 'Error al eliminar el consultorio';
        return respuestaEstandar(res, 400, false, 'Error al eliminar el consultorio', mensaje);
    }
};

export { getConsultorios, createConsultorio, deleteConsultorio };
