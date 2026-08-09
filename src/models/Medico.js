const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    matricula: { type: String, required: true, unique: true },
    especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad', required: true },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medico', medicoSchema);