import type { Document, Types } from 'mongoose';

export interface IMedico extends Document {
    usuarioId: Types.ObjectId;
    nombre: string;
    apellido: string;
    matricula: string;
    especialidades: string[];
    telefono?: string;
    activo: boolean;
}
