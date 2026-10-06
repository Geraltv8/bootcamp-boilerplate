import type { Document, Types } from 'mongoose';
import type { Especialidad } from '../../turnos/types/TurnoEspecialidad.enum';

export interface IMedico extends Document {
    usuarioId: Types.ObjectId;
    nombre: string;
    apellido: string;
    matricula: string;
    especialidades: Especialidad[];
    telefono?: string;
    activo: boolean;
}
