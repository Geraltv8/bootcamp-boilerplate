const mongoose = require('mongoose');

const especialidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la especialidad es obligatorio'],
        unique: [true, 'Esa especialidad ya existe'],
        uppercase: true,
        trim: true,
    },
    descripcion: {
        type: String,
        maxlength: [300, 'La descripción no puede superar los 300 caracteres'],
    },
    duracionConsultaMinutos: {
        type: Number,
        default: 30,
        min: [10, 'La duración mínima de una consulta es de 10 minutos'],
    },
    activa: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    collection: 'especialidades',
});

especialidadSchema.set('toJSON', {
    transform: (documento, especialidadRetorno) => {
        especialidadRetorno.id = especialidadRetorno._id;
        delete especialidadRetorno._id;
        delete especialidadRetorno.__v;
    }
});

module.exports = mongoose.model('Especialidad', especialidadSchema);
