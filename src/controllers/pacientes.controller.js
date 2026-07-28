const Paciente = require('../models/Paciente');
const respuestaEstandar = require('../utils/respuestaEstandar');


const getPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find();

        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos exitosamente', pacientes);

    } catch (error) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', error.message);
    }
};

const createPaciente = async (req, res) => {
    try {
        const nuevoPaciente = await Paciente.create(req.body);

        return respuestaEstandar(res, 201, true, 'Paciente creado exitosamente', nuevoPaciente);

    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);

            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
        }

        
        return respuestaEstandar(res, 500, false, 'Error al crear el paciente', error.message);
    }
};

const deletePaciente = async (req, res)=>{
    try {
        const { id } = req.params;
        const turno = await Paciente.findByIdAndDelete(id);
        if (!turno) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }
        return respuestaEstandar(res, 200, true, 'Paciente eliminado correctamente', turno);
    } catch (error) {
       
        return respuestaEstandar(res, 400 , false, 'Error al eliminar el paciente', error.message);
    }
};
module.exports = {
    getPacientes,
    createPaciente,
    deletePaciente
};