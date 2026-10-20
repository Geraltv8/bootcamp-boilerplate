import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { EstadoTurno } from './types/TurnoEstado.enum.js';
import Turno from './Turno.model.js';
import Medico from '../medicos/Medico.model.js';
import { verificarDisponibilidadTurno } from './services/verificarDisponibilidadTurno.js';
import type { CrearTurnoDTO, IQueryUrgencia } from './dtos/turno.schema.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';
import type { ITurno } from './types/Turno.interface.js';

const getTurnos = async (
    req: Request<unknown, unknown, unknown, { id?: string }>,
    res: Response,
) => {
    try {
        const { id } = req.query;

        if (id) {
            const turno = await Turno.findById(id).populate('paciente');
            if (!turno) {
                return respuestaEstandar(res, 404, false, 'Turno no encontrado');
            }
            return respuestaEstandar<ITurno>(res, 200, true, 'Turnos obtenidos exitosamente', turno);
        }

        const turnos = await Turno.find({ activo: true }).populate('paciente');
        return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error interno del servidor', obtenerMensajeError(error));
    }
};

const createTurno = async (
    req: Request<unknown, unknown, CrearTurnoDTO, IQueryUrgencia>,
    res: Response,
) => {
    try {
        const esUrgente = req.query.urgencia === 'true';
        const { medicoId, ...datosBase } = req.body;

        if (medicoId) {
            const medico = await Medico.exists({ _id: medicoId, activo: true });
            if (!medico) {
                return respuestaEstandar(res, 400, false, 'El médico asignado no existe o está inactivo');
            }

            const disponible = await verificarDisponibilidadTurno(medicoId, new Date(req.body.fechaTurno));
            if (!disponible) {
                return respuestaEstandar(res, 409, false, 'El médico ya tiene un turno asignado en ese horario');
            }
        }

        const datosDelTurno = {
            ...datosBase,
            ...(medicoId ? { medicoId: new Types.ObjectId(medicoId) } : {}),
            estado: esUrgente ? EstadoTurno.ATENDIDO : datosBase.estado ?? EstadoTurno.PENDIENTE,
            observaciones: esUrgente ? 'ingreso por guardia medica' : datosBase.observaciones ?? '',
        };

        const nuevoTurno = await Turno.create(datosDelTurno);
        return respuestaEstandar(res, 201, true, 'Turno creado exitosamente', nuevoTurno);
    } catch (error: unknown) {
        if (error instanceof Error && 'errors' in error) {
            const errores = Object.values((error as { errors: Record<string, { message: string }> }).errors).map(
                (err) => err.message,
            );
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 500, false, 'Error interno del servidor', obtenerMensajeError(error));
    }
};

const deleteTurno = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const turnoBorrado = await Turno.findByIdAndUpdate(
            id,
            { activo: false, estado: EstadoTurno.CANCELADO },
            { new: true },
        );

        if (!turnoBorrado) {
            return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
        }

        return respuestaEstandar(res, 200, true, 'Turno eliminado exitosamente', turnoBorrado);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'ID con formato invalido', obtenerMensajeError(error));
    }
};

const marcarAtendido = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body as { estado?: EstadoTurno };

        const siguienteEstado = estado ?? EstadoTurno.ATENDIDO;

        const turnoActualizado = await Turno.findByIdAndUpdate(
            id,
            { estado: siguienteEstado },
            { new: true },
        );

        if (!turnoActualizado) {
            return respuestaEstandar(res, 404, false, 'turno no encontrado', id);
        }

        return respuestaEstandar(res, 200, true, 'turno actualizado', turnoActualizado);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error de servidor', obtenerMensajeError(error));
    }
};

export { getTurnos, createTurno, deleteTurno, marcarAtendido };