const mongoose = require('mongoose');

const especialidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la especialidad es obligatorio'],
        unique: [true, 'El nombre de la especialidad debe ser único'],
        uppercase: true,
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción de la especialidad es obligatoria']
    },
    duracionTurno: {
        type: Number,
        required: [true, 'La duración del turno es obligatoria'],
        min: [1, 'La duración del turno debe ser mayor a 0']
    },
    activo: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});

especialidadSchema.set('toJSON', {
    transform: (documento, especialidadRetorno) => {
        especialidadRetorno.id = especialidadRetorno._id;
        delete especialidadRetorno._id;
        delete especialidadRetorno.__v;
    }
});

module.exports = mongoose.model('Especialidad', especialidadSchema);
