import type { Document } from 'mongoose';
import type { EspecialidadConsultorio } from './EspecialidadConsultorio.enum';

export interface IConsultorio extends Document {
    nombre: string;
    especialidad: EspecialidadConsultorio;
    piso: number;
    capacidad: number;
    observaciones: string;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
