const mongoose = require('mongoose');

const consultorioSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: [true, 'El número de consultorio es obligatorio'],
        unique: [true, 'Ese número de consultorio ya existe'],
    },
    piso: {
        type: String,
        required: [true, 'El piso es obligatorio'],
    },
    especialidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: [true, 'La especialidad asignada al consultorio es obligatoria'],
    },
    capacidad: {
        type: Number,
        default: 1,
        min: [1, 'La capacidad mínima es 1'],
    },
    disponible: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

consultorioSchema.set('toJSON', {
    transform: (documento, consultorioRetorno) => {
        consultorioRetorno.id = consultorioRetorno._id;
        delete consultorioRetorno._id;
        delete consultorioRetorno.__v;
    }
});

module.exports = mongoose.model('Consultorio', consultorioSchema);
