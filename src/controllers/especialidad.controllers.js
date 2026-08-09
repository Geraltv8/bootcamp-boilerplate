const Especialidad = require('../models/Especialidad');
const respuestaEstandar = require('../utils/respuestaEstandar');

const crearEspecialidad = async (req, res) => {
    try {
        const nuevaEspecialidad = await Especialidad.create(req.body);
        return respuestaEstandar(res, 201, true, "Especialidad creada", nuevaEspecialidad);
    } catch (error) {
        return respuestaEstandar(res, 400, false, "Error al crear", error.message);
    }
};

const obtenerEspecialidades = async (req, res) => {
    try {
        const especialidades = await Especialidad.find();
        return respuestaEstandar(res, 200, true, "Especialidades obtenidas", especialidades);
    } catch (error) {
        return respuestaEstandar(res, 400, false, "Error al obtener", error.message);
    }
};

module.exports = { crearEspecialidad, obtenerEspecialidades };