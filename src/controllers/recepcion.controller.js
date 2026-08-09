const mongoose = require('mongoose');
const Turno = require('../models/Turno');
const Paciente = require('../models/Paciente');
const respuestaEstandar = require('../utils/respuestaEstandar');

const registrarIngreso = async (req, res) => {
    try {
        const { datosPaciente, especialidad, fechaTurno, estado, observaciones } = req.body;

        // 1. Creamos el paciente de forma directa sin la sesión
        const nuevoPaciente = await Paciente.create(datosPaciente);

        // 2. Creamos el turno vinculándolo al ID del paciente recién creado
        const nuevoTurno = await Turno.create({
            paciente: nuevoPaciente._id,
            especialidad,
            fechaTurno,
            estado: estado || 'pendiente',
            observaciones
        });

        // 3. Buscamos el turno completo para devolverlo en la respuesta
        const turnoCompleto = await Turno.findById(nuevoTurno._id).populate('paciente');

        return respuestaEstandar(res, 201, true, "ingreso paciente nuevo", turnoCompleto);
        
    } catch (error) {
        // Mantenemos tu manejo de errores intacto
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        // Cambié el mensaje de "transaccion abortada" para que tenga más sentido ahora
        return respuestaEstandar(res, 400, false, "Error al registrar el ingreso", error.message);
    }
};

module.exports = { registrarIngreso };