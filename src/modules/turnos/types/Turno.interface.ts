import { Types, Document } from 'mongoose';
import { Especialidad } from './TurnoEspecialidad.enum';
import { EstadoTurno } from './TurnoEstado.enum';

export interface ITurno extends Document {
    id?: Types.ObjectId;
    paciente: Types.ObjectId;
    medicoId?: Types.ObjectId;
    especialidad: Especialidad;
    fechaTurno: Date;
    estado?: EstadoTurno;
    observaciones?: string;
    activo: boolean;
}

