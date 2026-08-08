const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del médico es obligatorio'],
        uppercase: true,
    },
    apellido: {
        type: String,
        required: [true, 'El apellido del médico es obligatorio'],
        uppercase: true,
    },
    dni: {
        type: String,
        required: [true, 'El DNI del médico es obligatorio'],
        unique: [true, 'El DNI del médico debe ser único'],
        match: [/^[0-9]{7,8}$/, 'El DNI debe tener 8 dígitos']
    },
    especialidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: [true, 'La especialidad del médico es obligatoria'],
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono del médico es obligatorio'],
        match: [/^[0-9]{7,10}$/, 'El teléfono no es válido']
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico del médico es obligatorio'],
        unique: [true, 'El correo electrónico del médico debe ser único'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido']
    },
    activo: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});

medicoSchema.set('toJSON', {
    transform: (documento, medicoRetorno) => {
        medicoRetorno.id = medicoRetorno._id;
        delete medicoRetorno._id;
        delete medicoRetorno.__v;
    }
});

module.exports = mongoose.model('Medico', medicoSchema);
