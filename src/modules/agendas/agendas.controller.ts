import type { Request, Response } from 'express';
import Agenda from './Agenda.model.js';
import Medico from '../medicos/Medico.model.js';
import type { IActualizarAgendaDTO, ICrearAgendaDTO } from './dtos/Agenda.schema.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';

const minutos = (hora: string): number => {
    const [horas, mins] = hora.split(':').map(Number);
    return (horas ?? 0) * 60 + (mins ?? 0);
};

const validarSolapamiento = async (
    medicoId: string,
    diaSemana: number,
    horaInicio: string,
    horaFin: string,
    excluirId?: string,
): Promise<boolean> => {
    const agendas = await Agenda.find({
        medicoId,
        diaSemana,
        activo: true,
        ...(excluirId ? { _id: { $ne: excluirId } } : {}),
    });
    return agendas.some((agenda) => minutos(horaInicio) < minutos(agenda.horaFin)
        && minutos(horaFin) > minutos(agenda.horaInicio));
};

const getAgendas = async (
    req: Request<{ medicoId: string }, unknown, unknown, { incluirInactivas?: string }>,
    res: Response,
) => {
    try {
        const medico = await Medico.findById(req.params.medicoId);
        if (!medico) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
        const mostrarTodas = req.query.incluirInactivas === 'true' && req.usuario?.rol === 'ADMIN';
        const agendas = await Agenda.find({
            medicoId: req.params.medicoId,
            ...(mostrarTodas ? {} : { activo: true }),
        }).sort({ diaSemana: 1, horaInicio: 1 });
        return respuestaEstandar(res, 200, true, 'Agendas obtenidas exitosamente', agendas);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener agendas', obtenerMensajeError(error));
    }
};

const createAgenda = async (req: Request<{ medicoId: string }, unknown, ICrearAgendaDTO>, res: Response) => {
    try {
        const medico = await Medico.findOne({ _id: req.params.medicoId, activo: true });
        if (!medico) return respuestaEstandar(res, 404, false, 'Médico no encontrado o inactivo');
        const { diaSemana, horaInicio, horaFin, duracionMinutos } = req.body;
        if (await validarSolapamiento(req.params.medicoId, diaSemana, horaInicio, horaFin)) {
            return respuestaEstandar(res, 409, false, 'La agenda se solapa con otra disponibilidad del médico');
        }
        const agenda = await Agenda.create({ ...req.body, medicoId: medico._id });
        return respuestaEstandar(res, 201, true, 'Agenda creada exitosamente', agenda);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al crear agenda', obtenerMensajeError(error));
    }
};

const updateAgenda = async (req: Request<{ id: string }, unknown, IActualizarAgendaDTO>, res: Response) => {
    try {
        const agenda = await Agenda.findById(req.params.id);
        if (!agenda) return respuestaEstandar(res, 404, false, 'Agenda no encontrada');
        const actualizada = {
            diaSemana: req.body.diaSemana ?? agenda.diaSemana,
            horaInicio: req.body.horaInicio ?? agenda.horaInicio,
            horaFin: req.body.horaFin ?? agenda.horaFin,
            duracionMinutos: req.body.duracionMinutos ?? agenda.duracionMinutos,
            activo: req.body.activo ?? agenda.activo,
        };
        const inicio = actualizada.horaInicio;
        const fin = actualizada.horaFin;
        if (minutos(inicio) >= minutos(fin) || actualizada.duracionMinutos > minutos(fin) - minutos(inicio)) {
            return respuestaEstandar(res, 400, false, 'El inicio debe preceder al fin y la duración debe caber en el bloque');
        }
        if (actualizada.activo && await validarSolapamiento(
            String(agenda.medicoId),
            actualizada.diaSemana,
            inicio,
            fin,
            String(agenda._id),
        )) {
            return respuestaEstandar(res, 409, false, 'La agenda se solapa con otra disponibilidad del médico');
        }
        Object.assign(agenda, req.body);
        await agenda.save();
        return respuestaEstandar(res, 200, true, 'Agenda actualizada exitosamente', agenda);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar agenda', obtenerMensajeError(error));
    }
};

const deleteAgenda = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const agenda = await Agenda.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
        if (!agenda) return respuestaEstandar(res, 404, false, 'Agenda no encontrada');
        return respuestaEstandar(res, 200, true, 'Agenda dada de baja exitosamente', agenda);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al dar de baja agenda', obtenerMensajeError(error));
    }
};

export { getAgendas, createAgenda, updateAgenda, deleteAgenda };
