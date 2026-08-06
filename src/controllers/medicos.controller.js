const Medico = require('../models/Medico');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getMedicos = async (req, res) => {
    try {
        const { especialidad, activo } = req.query;
        const filtro = {};

        if (especialidad) {
            filtro.especialidad = especialidad;
        }

        if (activo) {
            filtro.activo = activo === 'true';
        }

        const medicos = await Medico.find(filtro).populate('especialidad');
        return respuestaEstandar(res, 200, true, 'Médicos obtenidos exitosamente', medicos);
    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los médicos', error.message);
    }
};

const getMedicoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const medico = await Medico.findById(id).populate('especialidad');

        if (!medico) {
            return respuestaEstandar(res, 404, false, 'Médico no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Médico obtenido exitosamente', medico);
    } catch (error) {
        return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
    }
};

const createMedico = async (req, res) => {
    try {
        const nuevoMedico = await Medico.create(req.body);
        return respuestaEstandar(res, 201, true, 'Médico creado exitosamente', nuevoMedico);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        if (error.code === 11000) {
            return respuestaEstandar(res, 400, false, 'La matrícula o el email ya están registrados');
        }

        return respuestaEstandar(res, 500, false, 'Error al crear el médico', error.message);
    }
};

const updateMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoActualizado = await Medico.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!medicoActualizado) {
            return respuestaEstandar(res, 404, false, 'Médico no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Médico actualizado exitosamente', medicoActualizado);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 400, false, 'Error al actualizar el médico', error.message);
    }
};

// Baja lógica: no se borra de la base, se marca como inactivo (mismo criterio que Turno)
const deleteMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoBorrado = await Medico.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!medicoBorrado) {
            return respuestaEstandar(res, 404, false, 'Médico no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Médico dado de baja correctamente', medicoBorrado);
    } catch (error) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el médico', error.message);
    }
};

module.exports = {
    getMedicos,
    getMedicoPorId,
    createMedico,
    updateMedico,
    deleteMedico,
};
