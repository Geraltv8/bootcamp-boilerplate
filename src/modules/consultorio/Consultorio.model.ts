import { Schema, model, type Document } from 'mongoose';
import type { IConsultorio } from './types/Consultorio.interface';
import { EspecialidadConsultorio } from './types/EspecialidadConsultorio.enum';

const consultorioSchema = new Schema<IConsultorio>({
    nombre: {
        type: String,
        required: [true, 'El nombre del consultorio es obligatorio'],
        unique: [true, 'El nombre del consultorio debe ser único'],
        uppercase: true,
        trim: true,
    },
    especialidad: {
        type: String,
        required: [true, 'La especialidad del consultorio es obligatoria'],
        enum: {
            values: Object.values(EspecialidadConsultorio),
            message: '{VALUE} no es una especialidad válida',
        },
    },
    piso: {
        type: Number,
        required: [true, 'El piso del consultorio es obligatorio'],
        min: [1, 'El piso debe ser mayor o igual a 1'],
    },
    capacidad: {
        type: Number,
        required: [true, 'La capacidad del consultorio es obligatoria'],
        min: [1, 'La capacidad debe ser mayor a 0'],
    },
    observaciones: {
        type: String,
        default: '',
        maxlength: [250, 'Las observaciones no pueden superar los 250 caracteres'],
    },
    activo: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

consultorioSchema.set('toJSON', {
    transform: (_documento: Document, consultorioRetorno: Record<string, any>) => {
        consultorioRetorno.id = consultorioRetorno._id;
        delete consultorioRetorno._id;
        delete consultorioRetorno.__v;
    },
});

const ConsultorioModel = model<IConsultorio>('Consultorio', consultorioSchema);

export default ConsultorioModel;
