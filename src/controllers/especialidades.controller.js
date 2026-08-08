const Especialidad = require('../models/Especialidad');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getEspecialidades = async (req, res) => {
    try {
        // ?nombre=CARDIOLOGIA
        const { nombre } = req.query;

        const filtro = { activo: true };

        if (nombre) {
            filtro.nombre = nombre.toUpperCase();
        }

        const especialidades = await Especialidad.find(filtro);

        return respuestaEstandar(res, 200, true, 'Especialidades obtenidas exitosamente', especialidades);

    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener las especialidades', error.message);
    }
};

const getEspecialidadById = async (req, res) => {
    try {
        const { id } = req.params;

        const especialidad = await Especialidad.findOne({ _id: id, activo: true });

        if (!especialidad) {
            return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Especialidad obtenida exitosamente', especialidad);

    } catch (error) {
        return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
    }
};

const createEspecialidad = async (req, res) => {
    try {
        const nuevaEspecialidad = await Especialidad.create(req.body);

        return respuestaEstandar(res, 201, true, 'Especialidad creada exitosamente', nuevaEspecialidad);

    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);

            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 500, false, 'Error al crear la especialidad', error.message);
    }
};

const updateEspecialidad = async (req, res) => {
    try {
        const { id } = req.params;

        const especialidadActualizada = await Especialidad.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!especialidadActualizada) {
            return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Especialidad actualizada exitosamente', especialidadActualizada);

    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);

            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 400, false, 'Error al actualizar la especialidad', error.message);
    }
};

const deleteEspecialidad = async (req, res) => {
    try {
        const { id } = req.params;

        const especialidadBorrada = await Especialidad.findByIdAndUpdate(id, { activo: false }, { new: true });

        if (!especialidadBorrada) {
            return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Especialidad eliminada exitosamente', especialidadBorrada);

    } catch (error) {
        return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
    }
};

module.exports = {
    getEspecialidades,
    getEspecialidadById,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad
};
