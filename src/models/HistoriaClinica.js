const mongoose = require('mongoose');

const HistoriaClinicaSchema = new mongoose.Schema({
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
        required: [true, 'La fecha del historia clinica es obligatoria'],
        validate: {
            validator: function(value) {
                return value >= new Date();
            },
            message: 'La fecha del historia clinica debe ser una fecha futura'
        }
    },
    antecedentes: {
        type: String,
        required: [true, 'Los antecedentes son obligatorios'],  
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
    activo: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true,
});


module.exports = mongoose.model('HistoriaClinica', HistoriaClinicaSchema);