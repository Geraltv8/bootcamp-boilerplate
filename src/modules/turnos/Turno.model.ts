import { Schema, model, type Document } from 'mongoose';
import type { ITurno } from './types/Turno.interface.js';
import { EstadoTurno } from './types/TurnoEstado.enum.js';

const turnoSchema = new Schema<ITurno>({
    paciente: {
        type: Schema.Types.ObjectId,
        ref: 'Paciente',
        required: [true, 'El ID del paciente es obligatorio'],
    },
    medicoId: {
        type: Schema.Types.ObjectId,
        ref: 'Medico',
    },
    consultorioId: {
        type: Schema.Types.ObjectId,
        ref: 'Consultorio',
    },
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    especialidad: {
        type: String,
        required: true,
        trim: true,
    },
    fechaTurno: {
        type: Date,
        required: [true, 'La fecha del turno es obligatoria'],
        validate: {
            validator: (value: Date) => value >= new Date(),
            message: 'La fecha del turno debe ser una fecha futura',
        },
    },
    estado: {
        type: String,
        enum: {
            values: Object.values(EstadoTurno),
            message: '{VALUE} no es un estado válido',
        },
        default: EstadoTurno.PENDIENTE,
    },
    observaciones: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden superar los 500 caracteres'],
        default: '',
    },
    activo: {
        type: Boolean,
        default: true,
        select: false,
    },
}, {
    timestamps: true,
});

turnoSchema.index(
    { medicoId: 1, fechaTurno: 1 },
    {
        unique: true,
        partialFilterExpression: {
            medicoId: { $exists: true },
            activo: true,
        },
    },
);

turnoSchema.set('toJSON', {
    transform: (_documento: Document, turnoRetorno) => {
        const retorno = turnoRetorno as unknown as Record<string, unknown> & { _id?: unknown; __v?: unknown };
        retorno.id = retorno._id;
        delete retorno._id;
        delete retorno.__v;
    },
});

const TurnoModel = model<ITurno>('Turno', turnoSchema);

export default TurnoModel;