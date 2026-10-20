import { Types, Document } from 'mongoose';
import { EstadoTurno } from './TurnoEstado.enum.js';

export interface ITurno extends Document {
    id?: Types.ObjectId;
    paciente: Types.ObjectId;
    medicoId?: Types.ObjectId;
    consultorioId?: Types.ObjectId;
    creadoPor?: Types.ObjectId;
    especialidad: string;
    fechaTurno: Date;
    estado?: EstadoTurno;
    observaciones?: string;
    activo: boolean;
}
