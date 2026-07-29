const historiaClinicaController = require('../controllers/historiaClinica.controller');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getHistoriasClinicas = async (req, res) => {
    try {
        const { pacienteId, medicoId, fecha, sintomas} = req.params;

        const  filter = {};
        if (pacienteId) {
            filter.paciente = pacienteId;
        }
        if (medicoId) {
            filter.medico = medicoId;
        }
        if (fecha) {
            filter.fecha = fecha;
        }
        if (sintomas) {
            filter.sintomas = { $in: sintomas.split(',') };
        }
        const historiasClinicas = await historiaClinicaController.getHistoriasClinicas(filter);   

        return respuestaEstandar(res, 200, true, 'Historias clínicas obtenidas exitosamente', historiasClinicas);
    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener las historias clínicas', error.message);
    }   
}

const getHistoriaClinicaById = async (req, res) => {
    try {
        const { id } = req.params;
        const historiaClinica = await historiaClinicaController.getHistoriaClinicaById(id);

        return respuestaEstandar(res, 200, true, 'Historia clínica obtenida exitosamente', historiaClinica);
    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener la historia clínica', error.message);
    }
}

const createHistoriaClinica = async (req, res) => {
    try {
        const nuevaHistoriaClinica = await historiaClinicaController.createHistoriaClinica(req.body);   

        return respuestaEstandar(res, 201, true, 'Historia clínica creada exitosamente', nuevaHistoriaClinica);
        
    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }
        return respuestaEstandar(res, 500, false, 'Error al crear la historia clínica', error.message);
    }
}

module.exports = {
    getHistoriasClinicas,
    getHistoriaClinicaById,
    createHistoriaClinica
};