import { model, Schema, Types, type Document } from 'mongoose';

export interface IAgenda extends Document {
    medicoId: Types.ObjectId;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    duracionMinutos: number;
    activo: boolean;
}

const agendaSchema = new Schema<IAgenda>({
    medicoId: { type: Schema.Types.ObjectId, ref: 'Medico', required: true, index: true },
    diaSemana: { type: Number, required: true, min: 0, max: 6 },
    horaInicio: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    horaFin: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    duracionMinutos: { type: Number, required: true, min: 1 },
    activo: { type: Boolean, default: true },
}, { timestamps: true });

agendaSchema.index({ medicoId: 1, diaSemana: 1, activo: 1 });

export default model<IAgenda>('Agenda', agendaSchema);
