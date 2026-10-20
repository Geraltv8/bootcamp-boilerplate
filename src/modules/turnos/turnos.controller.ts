import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { EstadoTurno } from './types/TurnoEstado.enum.js';
import Turno from './Turno.model.js';
import type { CrearTurnoDTO, IQueryTurnos } from './dtos/turno.schema.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';
import { obtenerDisponibilidad, crearReserva } from './services/turnos.service.js';
import type { Rol } from '../auth/Usuario.model.js';

const getDisponibilidad = async (
    req: Request<unknown, unknown, unknown, { especialidadId: string; fecha: string; medicoId?: string }>,
    res: Response,
) => {
    try {
        const horarios = await obtenerDisponibilidad(req.query);
        return respuestaEstandar(res, 200, true, 'Horarios disponibles obtenidos', horarios);
    } catch (error: unknown) {
        const status = error instanceof RangeError ? 400 : 500;
        return respuestaEstandar(res, status, false, 'No se pudo consultar disponibilidad', obtenerMensajeError(error));
    }
};

const getMisTurnos = async (req: Request, res: Response) => {
    try {
        const turnos = await Turno.find({
            paciente: new Types.ObjectId(req.usuario?.id),
            estado: EstadoTurno.PENDIENTE,
            fechaTurno: { $gte: new Date() },
            activo: true,
        })
            .sort({ fechaTurno: 1 })
            .populate('medicoId', 'nombre apellido especialidades')
            .populate('consultorioId', 'nombre piso');
        return respuestaEstandar(res, 200, true, 'Próximos turnos obtenidos', turnos);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los turnos', obtenerMensajeError(error));
    }
};

const getTurnos = async (
    req: Request<unknown, unknown, unknown, IQueryTurnos>,
    res: Response,
) => {
    try {
        const rol = req.usuario?.rol as Rol | undefined;
        const filtro: Record<string, unknown> = {};

        if (rol === 'PACIENTE') {
            filtro.paciente = new Types.ObjectId(req.usuario?.id);
        } else if (req.query.pacienteId) {
            filtro.paciente = new Types.ObjectId(req.query.pacienteId);
        }
        if (req.query.estado) filtro.estado = req.query.estado;
        if (req.query.medicoId && rol !== 'PACIENTE') filtro.medicoId = req.query.medicoId;

        const fecha = req.query.fecha ?? (rol === 'RECEPCIONISTA' || rol === 'ADMIN'
            ? new Date().toISOString().slice(0, 10)
            : undefined);
        if (fecha) {
            const inicio = new Date(`${fecha}T00:00:00.000Z`);
            const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
            filtro.fechaTurno = { $gte: inicio, $lt: fin };
        }

        const turnos = await Turno.find(filtro)
            .select('+activo')
            .sort({ fechaTurno: 1 })
            .populate('paciente', 'nombre dni telefono')
            .populate('medicoId', 'nombre apellido matricula')
            .populate('consultorioId', 'nombre piso');
        return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error interno del servidor', obtenerMensajeError(error));
    }
};

const getTurno = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const filtro: Record<string, unknown> = { _id: req.params.id, activo: true };
        if (req.usuario?.rol === 'PACIENTE') filtro.paciente = new Types.ObjectId(req.usuario.id);
        const turno = await Turno.findOne(filtro)
            .select('+activo')
            .populate('paciente', 'nombre dni telefono')
            .populate('medicoId', 'nombre apellido matricula')
            .populate('consultorioId', 'nombre piso');
        if (!turno || !turno.activo) return respuestaEstandar(res, 404, false, 'Turno no encontrado');
        return respuestaEstandar(res, 200, true, 'Turno obtenido exitosamente', turno);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'No se pudo obtener el turno', obtenerMensajeError(error));
    }
};

const createTurno = async (req: Request<unknown, unknown, CrearTurnoDTO>, res: Response) => {
    try {
        if (!req.usuario?.id) return respuestaEstandar(res, 401, false, 'No se identificó al paciente');
        const turno = await crearReserva({
            pacienteId: req.usuario.id,
            especialidadId: req.body.especialidadId,
            fecha: req.body.fechaHoraInicio.slice(0, 10),
            fechaHoraInicio: new Date(req.body.fechaHoraInicio),
            ...(req.body.medicoId ? { medicoId: req.body.medicoId } : {}),
        });
        return respuestaEstandar(res, 201, true, 'Turno reservado exitosamente', turno);
    } catch (error: unknown) {
        const codigoError = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        const esConflicto = error instanceof RangeError || codigoError === 11000 || codigoError === 112 || codigoError === 251;
        return respuestaEstandar(
            res,
            esConflicto ? 409 : 500,
            false,
            esConflicto ? 'No se pudo reservar el turno' : 'Error interno del servidor',
            obtenerMensajeError(error),
        );
    }
};

const cancelarTurno = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const esPaciente = req.usuario?.rol === 'PACIENTE';
        const filtro: Record<string, unknown> = {
            _id: req.params.id,
            estado: EstadoTurno.PENDIENTE,
            activo: true,
        };
        if (esPaciente) {
            filtro.paciente = new Types.ObjectId(req.usuario?.id);
            filtro.fechaTurno = { $gte: new Date(Date.now() + 2 * 60 * 60 * 1000) };
        }
        const turno = await Turno.findOneAndUpdate(
            filtro,
            { estado: EstadoTurno.CANCELADO, activo: false },
            { new: true, runValidators: true },
        );
        if (!turno) {
            return respuestaEstandar(res, 409, false, 'El turno no existe, ya cambió de estado o no puede cancelarse');
        }
        return respuestaEstandar(res, 200, true, 'Turno cancelado exitosamente', turno);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al cancelar el turno', obtenerMensajeError(error));
    }
};

const actualizarEstadoTurno = async (
    req: Request<{ id: string }, unknown, { estado: EstadoTurno }>,
    res: Response,
) => {
    try {
        const turno = await Turno.findOneAndUpdate(
            { _id: req.params.id, estado: EstadoTurno.PENDIENTE, activo: true },
            {
                estado: req.body.estado,
            },
            { new: true, runValidators: true },
        );
        if (!turno) return respuestaEstandar(res, 409, false, 'El turno no existe o ya no está pendiente');
        return respuestaEstandar(res, 200, true, 'Estado del turno actualizado', turno);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el estado', obtenerMensajeError(error));
    }
};

const desactivarTurno = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const turno = await Turno.findOneAndUpdate(
            { _id: req.params.id, estado: EstadoTurno.PENDIENTE, activo: true },
            { estado: EstadoTurno.CANCELADO, activo: false },
            { new: true },
        );
        if (!turno) return respuestaEstandar(res, 404, false, 'Turno no encontrado o no pendiente');
        return respuestaEstandar(res, 200, true, 'Turno cancelado exitosamente', turno);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al cancelar el turno', obtenerMensajeError(error));
    }
};

export {
    getDisponibilidad,
    getMisTurnos,
    getTurnos,
    getTurno,
    createTurno,
    cancelarTurno,
    actualizarEstadoTurno,
    desactivarTurno,
};
