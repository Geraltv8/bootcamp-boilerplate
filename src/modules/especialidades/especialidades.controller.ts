import type { Request, Response } from 'express';
import Especialidad from './Especialidad.model.js';
import type {
    IActualizarEspecialidadDTO,
    ICrearEspecialidadDTO,
    IQueryEspecialidades,
} from './dtos/Especialidad.schema.js';
import Medico from '../medicos/Medico.model.js';
import Turno from '../turnos/Turno.model.js';
import { EstadoTurno } from '../turnos/types/TurnoEstado.enum.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';

const crearCodigo = (nombre: string): string => nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const getEspecialidades = async (
    req: Request<unknown, unknown, unknown, IQueryEspecialidades>,
    res: Response,
) => {
    try {
        const incluirInactivas = req.query.incluirInactivas === 'true' && req.usuario?.rol === 'ADMIN';
        const especialidades = await Especialidad.find(incluirInactivas ? {} : { activo: true }).sort({ nombre: 1 });
        return respuestaEstandar(res, 200, true, 'Especialidades obtenidas exitosamente', especialidades);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener especialidades', obtenerMensajeError(error));
    }
};

const getEspecialidad = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const especialidad = await Especialidad.findById(req.params.id);
        if (!especialidad) return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
        return respuestaEstandar(res, 200, true, 'Especialidad obtenida exitosamente', especialidad);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'No se pudo obtener la especialidad', obtenerMensajeError(error));
    }
};

const createEspecialidad = async (req: Request<unknown, unknown, ICrearEspecialidadDTO>, res: Response) => {
    try {
        const especialidad = await Especialidad.create({
            ...req.body,
            codigo: crearCodigo(req.body.nombre),
        });
        return respuestaEstandar(res, 201, true, 'Especialidad creada exitosamente', especialidad);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'Ya existe una especialidad con ese nombre o código');
        }
        return respuestaEstandar(res, 400, false, 'Error al crear especialidad', obtenerMensajeError(error));
    }
};

const updateEspecialidad = async (
    req: Request<{ id: string }, unknown, IActualizarEspecialidadDTO>,
    res: Response,
) => {
    try {
        const datos = { ...req.body };
        if (datos.activo === false) {
            const codigo = (await Especialidad.findById(req.params.id))?.codigo;
            if (!codigo) return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
            const [medicoActivo, turnoPendiente] = await Promise.all([
                Medico.exists({ especialidades: codigo, activo: true }),
                Turno.exists({
                    especialidad: codigo,
                    estado: EstadoTurno.PENDIENTE,
                    fechaTurno: { $gte: new Date() },
                }),
            ]);
            if (medicoActivo || turnoPendiente) {
                return respuestaEstandar(res, 409, false, 'No se puede desactivar una especialidad vinculada a médicos o turnos pendientes futuros');
            }
        }
        const especialidad = await Especialidad.findByIdAndUpdate(req.params.id, datos, {
            new: true,
            runValidators: true,
        });
        if (!especialidad) return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
        return respuestaEstandar(res, 200, true, 'Especialidad actualizada exitosamente', especialidad);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'Ya existe una especialidad con ese nombre o código');
        }
        return respuestaEstandar(res, 400, false, 'Error al actualizar especialidad', obtenerMensajeError(error));
    }
};

const deleteEspecialidad = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const especialidad = await Especialidad.findById(req.params.id);
        if (!especialidad) return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');

        const medicoActivo = await Medico.exists({
            especialidades: especialidad.codigo,
            activo: true,
        });
        const turnoPendiente = await Turno.exists({
            especialidad: especialidad.codigo,
            estado: EstadoTurno.PENDIENTE,
            fechaTurno: { $gte: new Date() },
        });
        if (medicoActivo || turnoPendiente) {
            return respuestaEstandar(res, 409, false, 'Desvincule médicos y turnos pendientes antes de dar de baja la especialidad');
        }

        especialidad.activo = false;
        await especialidad.save();
        return respuestaEstandar(res, 200, true, 'Especialidad dada de baja exitosamente', especialidad);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al dar de baja especialidad', obtenerMensajeError(error));
    }
};

export { getEspecialidades, getEspecialidad, createEspecialidad, updateEspecialidad, deleteEspecialidad };
