const HistoriaClinica = require('../models/historiaClinica');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getHistoriasClinicas = async (req, res) => {
    try {
        const historias = await HistoriaClinica.find();
        return respuestaEstandar(res, 200, historias);
    } catch (error) {
        return respuestaEstandar(res, 500, {
            message: 'Error al obtener las historias clínicas'
        });
    }
};

const createHistoriaClinica = async (req, res) => {
    try {
        const historia = await HistoriaClinica.create(req.body);
        return respuestaEstandar(res, 201, historia);
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

        return respuestaEstandar(res, 500, {
            message: 'Error al crear la historia clínica'
        });
    }
};

const deleteHistoriaClinica = async (req, res) => {
    try {
        const historia = await HistoriaClinica.findByIdAndDelete(req.params.id);

        if (!historia) {
            return respuestaEstandar(res, 404, {
                message: 'Historia clínica no encontrada'
            });
        }

        return respuestaEstandar(res, 200, {
            message: 'Historia clínica eliminada correctamente'
        });
    } catch (error) {

        if (error.name === 'CastError') {
            return respuestaEstandar(res, 400, {
                message: 'ID inválido'
            });
        }

        return respuestaEstandar(res, 500, {
            message: 'Error al eliminar la historia clínica'
        });
    }
};

module.exports = {
    getHistoriasClinicas,
    createHistoriaClinica,
    deleteHistoriaClinica
}; 