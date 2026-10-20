import { Schema, model, type Document } from 'mongoose';
import type { IPaciente } from './types/Paciente.interface.js';
import { ObraSocial } from './types/PacienteObraSocial.enum.js';
import { TipoTelefono } from './types/PacienteTelefono.enum.js';

const pacienteSchema = new Schema<IPaciente>({
    nombre: {
        type: String,
        default: 'PACIENTE',
        uppercase: true,
        trim: true,
    },
    dni: {
        type: String,
        required: [true, 'El DNI del paciente es obligatorio'],
        unique: [true, 'El DNI del paciente debe ser único'],
        match: [/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'],
    },
    direccion: {
        type: new Schema({
            calle: { type: String, default: 'Sin información' },
            numero: { type: String, default: 'S/N' },
            piso: { type: String, default: '' },
            departamento: { type: String, default: '' },
            barrio: { type: String, default: 'Sin información' },
        }),
        default: () => ({}),
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido'],
    },
    telefono: {
        tipo: {
            type: String,
            enum: Object.values(TipoTelefono),
            default: TipoTelefono.CELULAR,
        },
        codigoArea: {
            type: String,
            default: '',
            match: [/^[0-9]{0,5}$/, 'El código de área no es válido'],
        },
        numero: {
            type: String,
            required: true,
            match: [/^[0-9]{7,15}$/, 'El número de teléfono no es válido'],
        },
    },
    obraSocial: {
        type: new Schema({
            nombre: {
                type: String,
                enum: {
                    values: Object.values(ObraSocial),
                    message: '{VALUE} no es una obra social válida',
                },
                default: ObraSocial.NINGUNA,
            },
            numeroAfiliado: { type: String, default: '' },
        }),
        default: () => ({}),
    },
    historialMedico: {
        type: new Schema({
            fecha: Date,
            diagnostico: String,
            tratamiento: String,
            medico: String,
        }),
        required: false,
    },
    activo: { type: Boolean, default: true },
    revisionReserva: { type: Number, default: 0, select: false },
}, {
    timestamps: true,
});

pacienteSchema.set('toJSON', {
    transform: (_documento: Document, pacienteRetorno) => {
        const retorno = pacienteRetorno as unknown as Record<string, unknown> & { _id?: unknown; __v?: unknown };
        retorno.id = retorno._id;
        delete retorno._id;
        delete retorno.__v;
    },
});

const PacienteModel = model<IPaciente>('Paciente', pacienteSchema);

export default PacienteModel;