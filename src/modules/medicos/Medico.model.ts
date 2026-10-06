import { model, Schema } from 'mongoose';
import type { IMedico } from './types/Medico.interface';
import { Especialidad } from '../turnos/types/TurnoEspecialidad.enum';

const medicoSchema = new Schema<IMedico>({
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'La cuenta de usuario es obligatoria'],
        unique: true,
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        trim: true,
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
        trim: true,
    },
    matricula: {
        type: String,
        required: [true, 'La matrícula es obligatoria'],
        unique: true,
        match: [/^[a-zA-Z0-9]+$/, 'La matrícula debe ser alfanumérica'],
        trim: true,
    },
    especialidades: {
        type: [{
            type: String,
            enum: {
                values: Object.values(Especialidad),
                message: '{VALUE} no es una especialidad válida',
            },
        }],
        required: [true, 'Debe indicar al menos una especialidad'],
        validate: {
            validator: (especialidades: string[]) => especialidades.length > 0,
            message: 'Debe indicar al menos una especialidad',
        },
    },
    telefono: {
        type: String,
        trim: true,
    },
    activo: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export default model<IMedico>('Medico', medicoSchema);
