import mongoose, { Types } from 'mongoose';
import Agenda from '../../agendas/Agenda.model.js';
import Especialidad from '../../especialidades/Especialidad.model.js';
import Medico from '../../medicos/Medico.model.js';
import Consultorio from '../../consultorio/Consultorio.model.js';
import Paciente from '../../pacientes/Paciente.model.js';
import Turno from '../Turno.model.js';
import { EstadoTurno } from '../types/TurnoEstado.enum.js';

export interface IDisponibilidadInput {
    especialidadId: string;
    fecha: string;
    medicoId?: string;
}

export interface IHorarioDisponible {
    medicoId: string;
    nombreMedico: string;
    fechaHoraInicio: Date;
    duracionMinutos: number;
}

const DIA_MS = 24 * 60 * 60 * 1000;

const obtenerRangoFecha = (fecha: string): { inicio: Date; fin: Date } => {
    const inicio = new Date(`${fecha}T00:00:00.000Z`);
    const fin = new Date(inicio.getTime() + DIA_MS);
    return { inicio, fin };
};

const validarVentanaFecha = (fecha: string): boolean => {
    const { inicio } = obtenerRangoFecha(fecha);
    const hoy = new Date();
    const hoyUtc = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
    const limite = new Date(hoyUtc.getTime() + 30 * DIA_MS);
    return Number.isFinite(inicio.getTime()) && inicio >= hoyUtc && inicio <= limite;
};

const obtenerMinutos = (hora: string): number => {
    const [horas, minutos] = hora.split(':').map(Number);
    return (horas ?? 0) * 60 + (minutos ?? 0);
};

export const obtenerDisponibilidad = async (
    input: IDisponibilidadInput,
    session?: mongoose.ClientSession,
): Promise<IHorarioDisponible[]> => {
    if (!validarVentanaFecha(input.fecha)) {
        throw new RangeError('La fecha debe estar entre hoy y los próximos 30 días');
    }

    const especialidad = await Especialidad.findOne({ _id: input.especialidadId, activo: true }).session(session ?? null);
    if (!especialidad) throw new RangeError('La especialidad no existe o está inactiva');

    const { inicio, fin } = obtenerRangoFecha(input.fecha);
    const diaSemana = inicio.getUTCDay();
    const filtroMedico: Record<string, unknown> = {
        activo: true,
        especialidades: especialidad.codigo,
    };
    if (input.medicoId) filtroMedico._id = input.medicoId;

    const medicos = await Medico.find(filtroMedico).session(session ?? null);
    if (input.medicoId && medicos.length === 0) {
        throw new RangeError('El médico no existe, está inactivo o no ofrece esa especialidad');
    }
    if (medicos.length === 0) return [];

    const medicoIds = medicos.map((medico) => medico._id);
    const [agendas, turnos] = await Promise.all([
        Agenda.find({ medicoId: { $in: medicoIds }, diaSemana, activo: true }).session(session ?? null),
        Turno.find({
            medicoId: { $in: medicoIds },
            fechaTurno: { $gte: inicio, $lt: fin },
            estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.ATENDIDO] },
            activo: true,
        }).select('+activo').session(session ?? null),
    ]);

    const medicosPorId = new Map(medicos.map((medico) => [String(medico._id), medico]));
    const horarios: IHorarioDisponible[] = [];

    for (const agenda of agendas) {
        const medico = medicosPorId.get(String(agenda.medicoId));
        if (!medico) continue;
        const inicioBloque = obtenerMinutos(agenda.horaInicio);
        const finBloque = obtenerMinutos(agenda.horaFin);

        for (let minuto = inicioBloque; minuto + agenda.duracionMinutos <= finBloque; minuto += agenda.duracionMinutos) {
            const fechaHoraInicio = new Date(inicio.getTime() + minuto * 60_000);
            if (fechaHoraInicio <= new Date()) continue;
            const fechaHoraFin = new Date(fechaHoraInicio.getTime() + agenda.duracionMinutos * 60_000);
            const ocupado = turnos.some((turno) => {
                if (String(turno.medicoId) !== String(medico._id)) return false;
                const inicioTurno = turno.fechaTurno.getTime();
                const finTurno = inicioTurno + agenda.duracionMinutos * 60_000;
                return fechaHoraInicio.getTime() < finTurno && fechaHoraFin.getTime() > inicioTurno;
            });
            if (!ocupado) {
                horarios.push({
                    medicoId: String(medico._id),
                    nombreMedico: `${medico.nombre} ${medico.apellido}`,
                    fechaHoraInicio,
                    duracionMinutos: agenda.duracionMinutos,
                });
            }
        }
    }

    return horarios.sort((a, b) => a.fechaHoraInicio.getTime() - b.fechaHoraInicio.getTime());
};

export interface ICrearReservaInput extends IDisponibilidadInput {
    pacienteId: string;
    fechaHoraInicio: Date;
    consultorioId?: string;
    creadoPor?: string;
    observaciones?: string;
}

export const crearReserva = async (input: ICrearReservaInput) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const paciente = await Paciente.findOneAndUpdate(
            { _id: input.pacienteId, activo: true },
            { $inc: { revisionReserva: 1 } },
            { new: true, session, select: '+revisionReserva' },
        );
        if (!paciente || !paciente.activo) throw new RangeError('Paciente no encontrado o inactivo');
        if (input.fechaHoraInicio <= new Date()) throw new RangeError('No se pueden reservar turnos en el pasado');

        const especialidad = await Especialidad.findOne({ _id: input.especialidadId, activo: true }).session(session);
        if (!especialidad) throw new RangeError('La especialidad no existe o está inactiva');

        const turnosPendientes = await Turno.countDocuments({
            paciente: paciente._id,
            especialidad: especialidad.codigo,
            estado: EstadoTurno.PENDIENTE,
            activo: true,
        }).session(session);
        if (turnosPendientes >= 2) {
            throw new RangeError('El paciente ya tiene dos turnos pendientes para esta especialidad');
        }

        const opciones = await obtenerDisponibilidad({
            especialidadId: input.especialidadId,
            fecha: input.fechaHoraInicio.toISOString().slice(0, 10),
            ...(input.medicoId ? { medicoId: input.medicoId } : {}),
        }, session);
        const horario = opciones.find((opcion) => opcion.fechaHoraInicio.getTime() === input.fechaHoraInicio.getTime());
        if (!horario) throw new RangeError('El horario solicitado ya no está disponible');

        let consultorioId: Types.ObjectId | undefined;
        if (input.consultorioId) {
            const consultorio = await Consultorio.findOne({
                _id: input.consultorioId,
                activo: true,
                especialidad: especialidad.codigo,
            }).session(session);
            if (!consultorio) throw new RangeError('El consultorio no existe, está inactivo o no corresponde a la especialidad');
            consultorioId = consultorio._id;
        }

        const turnoData = {
            paciente: paciente._id,
            medicoId: new Types.ObjectId(horario.medicoId),
            especialidad: especialidad.codigo,
            fechaTurno: horario.fechaHoraInicio,
            estado: EstadoTurno.PENDIENTE,
            observaciones: input.observaciones ?? '',
            ...(consultorioId ? { consultorioId } : {}),
            ...(input.creadoPor ? { creadoPor: new Types.ObjectId(input.creadoPor) } : {}),
        };
        const [turno] = await Turno.create([turnoData], { session });
        if (!turno) throw new Error('No se pudo registrar el turno');

        await session.commitTransaction();
        return turno;
    } catch (error: unknown) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};
