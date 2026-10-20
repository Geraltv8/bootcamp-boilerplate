import { Schema, model, type Document } from 'mongoose';
import type { IPaciente } from './types/Paciente.interface.js';
import { ObraSocial } from './types/PacienteObraSocial.enum.js';
import { TipoTelefono } from './types/PacienteTelefono.enum.js';

const pacienteSchema = new Schema<IPaciente>({
    nombre: {
        type: String,
        required: [true, 'El nombre del paciente es obligatorio'],
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
        calle: {
            type: String,
            default: 'Sin información',
        },
        numero: {
            type: String,
            default: 'S/N',
        },
        piso: { type: String, default: '' },
        departamento: { type: String, default: '' },
        barrio: { type: String, default: 'Sin información' },
    },
    email: {
        type: String,
        required: [true, 'El correo electronico del paciente es obligatorio'],
        unique: [true, 'El correo electrónico del paciente debe ser único'],
        default: 'sin-email@autogenerado.local',
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
            default: '11',
            match: [/^[0-9]{2,5}$/, 'El código de área no es válido'],
        },
        numero: {
            type: String,
            required: true,
            match: [/^[0-9]{7,10}$/, 'El número de teléfono no es válido'],
        },
    },
    obraSocial: {
        nombre: {
            type: String,
            required: [true, 'El nombre de la obra social es obligatorio'],
            enum: {
                values: Object.values(ObraSocial),
                message: '{VALUE} no es una obra social válida. Debe ser una de las siguientes: PAMI, OSPEL, OSDE, SANCOR, OSECAC, SWISS MEDICAL, GALENO, MEDICUS, OMINT, FEMEBA, OTRAS, NINGUNA',
            },
            default: ObraSocial.NINGUNA,
        },
        numeroAfiliado: { type: String, default: '' },
    },
    historialMedico: {
        fecha: {
            type: Date,
            default: Date.now,
        },
        diagnostico: {
            type: String,
            default: 'Sin diagnóstico registrado',
        },
        tratamiento: {
            type: String,
            default: 'Sin tratamiento registrado',
        },
        medico: {
            type: String,
            default: 'Sistema',
        },
    },
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