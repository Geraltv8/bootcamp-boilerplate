const Consultorio = require('../models/Consultorio');
const respuestaEstandar = require('../utils/respuestaEstandar');

const getConsultorios = async (req, res) => {
  try {
    const { especialidad, profesionalResponsable, ciudad } = req.query;
    const filtro = { activo: true };

    if (especialidad) filtro.especialidad = especialidad;
    if (profesionalResponsable) filtro.profesionalResponsable = profesionalResponsable;
    if (ciudad) filtro.ciudad = ciudad;

    const consultorios = await Consultorio.find(filtro)
      .populate('especialidad')
      .populate('profesionalResponsable');

    return respuestaEstandar(res, 200, true, 'Consultorios obtenidos exitosamente', consultorios);
  } catch (error) {
    return respuestaEstandar(res, 500, false, 'Error al obtener consultorios', error.message);
  }
};

const createConsultorio = async (req, res) => {
  try {
    const nuevoConsultorio = await Consultorio.create(req.body);
    return respuestaEstandar(res, 201, true, 'Consultorio creado exitosamente', nuevoConsultorio);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return respuestaEstandar(res, 400, false, 'Error de validación', errores);
    }

    return respuestaEstandar(res, 500, false, 'Error al crear consultorio', error.message);
  }
};

const deleteConsultorio = async (req, res) => {
  try {
    const { id } = req.params;
    const consultorio = await Consultorio.findByIdAndUpdate(id, { activo: false }, { new: true });

    if (!consultorio) {
      return respuestaEstandar(res, 404, false, 'Consultorio no encontrado');
    }

    return respuestaEstandar(res, 200, true, 'Consultorio desactivado correctamente', consultorio);
  } catch (error) {
    return respuestaEstandar(res, 400, false, 'Error al eliminar consultorio', error.message);
  }
};

module.exports = {
  getConsultorios,
  createConsultorio,
  deleteConsultorio,
};
