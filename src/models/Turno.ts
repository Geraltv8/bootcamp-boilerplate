import { Schema, model } from 'mongoose';
import { ITurno } from "../interfaces/turnos/Turno.interface";
import { Especialidad } from '../interfaces/turnos/TurnoEspecialidad.enum';
import { EstadoTurno } from '../interfaces/turnos/TurnoEstado.enum';

const turnoSchema = new Schema<ITurno>({
    paciente: {
        type: Schema.Types.ObjectId,
        ref: 'Paciente',
        required: [true, 'El ID del paciente es obligatorio'],
    },
    especialidad: {
        type: String,
        required: true,
        enum: {
            values: Object.values(Especialidad),
            message: '{VALUE} no es una especialidad válida',
        },
    },
    fechaTurno: {
        type: Date,
        required: [true, 'La fecha del turno es obligatoria'],
        validate: {
            validator: function(value: Date) {
                return value >= new Date();
            },
            message: 'La fecha del turno debe ser una fecha futura',
        },
    },
    estado: {
        type: String,
        enum: {
            values: Object.values(EstadoTurno),
            message: '{VALUE} no es un estado válido',
        },
    },
    observaciones: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden superar los 500 caracteres'],
    },
    activo: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
        timestamps: true,
});

turnoSchema.set('toJSON', {
    transform: (documento, turnoRetorno) => {
        turnoRetorno.id = turnoRetorno._id;
        delete (turnoRetorno as { _id?: unknown })._id;
        delete (turnoRetorno as { __v?: unknown }).__v;
    }
});

const TurnoModel = model<ITurno>('Turno', turnoSchema);

export default TurnoModel;