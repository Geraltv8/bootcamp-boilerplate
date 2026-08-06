const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: [true, 'El ID del paciente es obligatorio'],
    },
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medico',
        required: [true, 'El ID del médico es obligatorio'],
    },
    fecha: {
        type: Date,
        required: [true, 'La fecha de la consulta es obligatoria'],
        default: Date.now,
    },
    motivoConsulta: {
        type: String,
        required: [true, 'El motivo de la consulta es obligatorio'],
    },
    diagnostico: {
        type: String,
        required: [true, 'El diagnóstico es obligatorio'],
    },
    tratamiento: {
        type: String,
        required: [true, 'El tratamiento es obligatorio'],
    },
    observaciones: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden superar los 500 caracteres'],
    },
}, {
    timestamps: true,
});

historiaClinicaSchema.set('toJSON', {
    transform: (documento, historiaRetorno) => {
        historiaRetorno.id = historiaRetorno._id;
        delete historiaRetorno._id;
        delete historiaRetorno.__v;
    }
});

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);
