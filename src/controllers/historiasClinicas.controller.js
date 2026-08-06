const HistoriaClinica = require('../models/HistoriaClinica');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getHistoriasClinicas = async (req, res) => {
    try {
        const { paciente, medico } = req.query;
        const filtro = {};

        if (paciente) {
            filtro.paciente = paciente;
        }

        if (medico) {
            filtro.medico = medico;
        }

        const historias = await HistoriaClinica.find(filtro)
            .populate('paciente')
            .populate('medico');

        return respuestaEstandar(res, 200, true, 'Historias clínicas obtenidas exitosamente', historias);
    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener las historias clínicas', error.message);
    }
};

const getHistoriaClinicaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const historia = await HistoriaClinica.findById(id)
            .populate('paciente')
            .populate('medico');

        if (!historia) {
            return respuestaEstandar(res, 404, false, 'Historia clínica no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Historia clínica obtenida exitosamente', historia);
    } catch (error) {
        return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
    }
};

const createHistoriaClinica = async (req, res) => {
    try {
        const nuevaHistoria = await HistoriaClinica.create(req.body);
        return respuestaEstandar(res, 201, true, 'Historia clínica creada exitosamente', nuevaHistoria);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 500, false, 'Error al crear la historia clínica', error.message);
    }
};

const updateHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;
        const historiaActualizada = await HistoriaClinica.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!historiaActualizada) {
            return respuestaEstandar(res, 404, false, 'Historia clínica no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Historia clínica actualizada exitosamente', historiaActualizada);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        return respuestaEstandar(res, 400, false, 'Error al actualizar la historia clínica', error.message);
    }
};

const deleteHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;
        const historiaBorrada = await HistoriaClinica.findByIdAndDelete(id);

        if (!historiaBorrada) {
            return respuestaEstandar(res, 404, false, 'Historia clínica no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Historia clínica eliminada correctamente', historiaBorrada);
    } catch (error) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar la historia clínica', error.message);
    }
};

module.exports = {
    getHistoriasClinicas,
    getHistoriaClinicaPorId,
    createHistoriaClinica,
    updateHistoriaClinica,
    deleteHistoriaClinica,
};
