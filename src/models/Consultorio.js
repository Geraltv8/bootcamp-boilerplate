const mongoose = require('mongoose');

const consultorioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del consultorio es obligatorio'],
    uppercase: true,
  },
  especialidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Especialidad',
    required: [true, 'La especialidad es obligatoria'],
  },
  profesionalResponsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medico',
    required: [true, 'El profesional responsable es obligatorio'],
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    match: [/^[0-9\s+\-()]{7,20}$/, 'El teléfono no es válido'],
  },
  correoElectronico: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    lowercase: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido'],
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
  },
  horarioAtencion: {
    type: String,
    required: [true, 'El horario de atención es obligatorio'],
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatoria'],
    uppercase: true,
  },
  activo: {
    type: Boolean,
    default: true,
    select: false,
  },
}, {
  timestamps: true,
});

consultorioSchema.set('toJSON', {
  transform: (documento, consultorioRetorno) => {
    consultorioRetorno.id = consultorioRetorno._id;
    delete consultorioRetorno._id;
    delete consultorioRetorno.__v;
  },
});

module.exports = mongoose.model('Consultorio', consultorioSchema);
