const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del médico es obligatorio'],
        uppercase: true,
        trim: true,
    },
    matricula: {
        type: String,
        required: [true, 'La matrícula del médico es obligatoria'],
        unique: [true, 'Esa matrícula ya está registrada'],
        match: [/^[0-9]{4,8}$/, 'La matrícula debe tener entre 4 y 8 dígitos'],
    },
    especialidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: [true, 'La especialidad del médico es obligatoria'],
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico del médico es obligatorio'],
        unique: [true, 'El correo electrónico ya está registrado'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido'],
    },
    telefono: {
        tipo: {
            type: String,
            enum: ['CELULAR', 'FIJO', 'TRABAJO'],
        },
        codigoArea: {
            type: String,
            required: true,
            match: [/^[0-9]{2,5}$/, 'El código de área no es válido'],
        },
        numero: {
            type: String,
            required: true,
            match: [/^[0-9]{7,10}$/, 'El número de teléfono no es válido'],
        },
    },
    diasAtencion: {
        type: [String],
        enum: {
            values: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'],
            message: '{VALUE} no es un día válido',
        },
    },
    activo: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

medicoSchema.set('toJSON', {
    transform: (documento, medicoRetorno) => {
        medicoRetorno.id = medicoRetorno._id;
        delete medicoRetorno._id;
        delete medicoRetorno.__v;
    }
});

module.exports = mongoose.model('Medico', medicoSchema);
