import type { Document } from 'mongoose';

export interface IConsultorio extends Document {
    nombre: string;
    especialidad: string;
    piso: number;
    capacidad: number;
    observaciones: string;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
