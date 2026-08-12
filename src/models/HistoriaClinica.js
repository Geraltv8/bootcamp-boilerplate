const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true,
    },
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medico',
        required: true
    },
    antecedentesPersonales: {
        type: String,
        required: [true, 'Los antecedentes personales son obligatorios'],
    },
    antecedentesFamiliares: {
        type: String,
        required: [true, 'Los antecedentes familiares son obligatorios'],
    },
    alergias: {
        type: String,
        required: [true, 'Las alergias son obligatorias'],
    },
    tratamientos: {
        type: String,
        required: [true, 'Los tratamientos son obligatorios'],
    }
}, {
    timestamps: true
});
historiaClinicaSchema.set('toJSON', {
    transform: (documento, historiaClinicaRetorno) => {
        historiaClinicaRetorno.id = historiaClinicaRetorno._id;
        delete historiaClinicaRetorno._id;
        delete historiaClinicaRetorno.__v;
        return historiaClinicaRetorno;
    }
});

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema); 