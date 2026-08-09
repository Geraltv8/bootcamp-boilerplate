const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    fecha: { type: Date, default: Date.now },
    diagnostico: { type: String, required: true },
    tratamiento: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);