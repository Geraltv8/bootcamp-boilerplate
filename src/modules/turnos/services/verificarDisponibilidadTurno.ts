import { Types } from 'mongoose';
import Turno from '../Turno.model';
import { EstadoTurno } from '../types/TurnoEstado.enum';

const DURACION_TURNO_MS = 30 * 60 * 1000;

export const verificarDisponibilidadTurno = async (
    medicoId: string,
    fechaDeseada: Date,
): Promise<boolean> => {
    if (!/^[a-f\d]{24}$/i.test(medicoId)) {
        throw new TypeError('El medicoId debe ser un ObjectId válido');
    }

    const fechaInicioMs = fechaDeseada.getTime();
    if (!Number.isFinite(fechaInicioMs)) {
        throw new TypeError('La fechaDeseada debe ser una fecha válida');
    }

    const fechaLimiteInferior = new Date(fechaInicioMs - DURACION_TURNO_MS);
    const fechaFin = new Date(fechaInicioMs + DURACION_TURNO_MS);
    const turnoSolapado = await Turno.exists({
        medicoId: new Types.ObjectId(medicoId),
        estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.ATENDIDO] },
        fechaTurno: {
            $gt: fechaLimiteInferior,
            $lt: fechaFin,
        },
    });

    return turnoSolapado === null;
};
