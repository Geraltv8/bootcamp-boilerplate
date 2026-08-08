const HistoriaClinica = require('../models/HistoriaClinica');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getHistoriasClinicas = async (req, res) => {
    try {
        const historias = await HistoriaClinica.find();
        return respuestaEstandar(res, 200, true, 'Historias clínicas obtenidas exitosamente', historias);
    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener las historias clínicas', error.message);
    }
};

const createHistoriaClinica = async (req, res) => {
    try {
        const historia = await HistoriaClinica.create(req.body);
        return respuestaEstandar(res, 201, true, 'Historia clínica creada exitosamente', historia);
    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);

            return respuestaEstandar(
                res,
                400,
                false,
                'Error de validación',
                errores
            );
        }

        return respuestaEstandar(res, 500, false, 'Error al crear la historia clínica', error.message);
    }
};

const deleteHistoriaClinica = async (req, res) => {
    try {
        const historia = await HistoriaClinica.findByIdAndDelete(req.params.id);

        if (!historia) {
            return respuestaEstandar(res, 404, false, 'Historia clínica no encontrada');
        }

        return respuestaEstandar(res, 200, true, 'Historia clínica eliminada correctamente', historia);
    } catch (error) {

        if (error.name === 'CastError') {
            return respuestaEstandar(res, 400, false, 'ID inválido');
        }

        return respuestaEstandar(res, 500, false, 'Error al eliminar la historia clínica', error.message);
    }
};

module.exports = {
    getHistoriasClinicas,
    createHistoriaClinica,
    deleteHistoriaClinica
}; 