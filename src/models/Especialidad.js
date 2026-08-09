const mongoose = require('mongoose');

const especialidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la especialidad es obligatorio'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    activa: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Especialidad', especialidadSchema);