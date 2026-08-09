const mongoose = require('mongoose');

const consultorioSchema = new mongoose.Schema({
    numero: { type: String, required: true, unique: true },
    piso: { type: String, required: true },
    disponible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Consultorio', consultorioSchema);