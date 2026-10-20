import { model, Schema, type Document } from 'mongoose';

export interface IEspecialidad extends Document {
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

const especialidadSchema = new Schema<IEspecialidad>({
    codigo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    activo: { type: Boolean, default: true },
}, { timestamps: true });

export default model<IEspecialidad>('Especialidad', especialidadSchema);
