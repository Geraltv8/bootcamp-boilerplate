const Turno = require('../models/Turno');

let turnos = [
    {id: 1, paciente: 'juan perez', dni: '3388557744', especialidad: 'cardiologia'},
    {id: 2, paciente: 'pedro perez', dni: '34234234234', especialidad: 'cardiologia'},
    {id: 3, paciente: 'maria Garcia', dni: '3231231345', especialidad: 'cardiologia'},
    {id: 4, paciente: 'luis Rodriguez', dni: '33812312744', especialidad: 'cardiologia'},
]

const respuestaEstandar = (res, status, success, message, data = null) => {
    return res.status(status).json({
        success,
        timestamp: new Date().toISOString(),
        message,
        total: Array.isArray(data) ? data.length : data ? 1 : 0,
        data
    });
};


const getTurnos = (req, res) => {
    respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
};

const createTurno = async (req, res) => {
    try {

        const nuevoTurno = await Turno.create(req.body);
        return respuestaEstandar(res, 201, true, 'Turno creado exitosamente', nuevoTurno);

    } catch (error) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
    }

    return respuestaEstandar(res, 500, false, 'Error interno del servidor', error.message);
  };
};

const deleteTurno = (req, res) => {
    const { id } = req.params;
    const turnoExiste = turnos.some(t => t.id === parseInt(id));

    if (!turnoExiste) {
        return respuestaEstandar(res, 404, false, 'Turno no encontrado');
    }

    turnos = turnos.filter(t => t.id !== parseInt(id));
    respuestaEstandar(res, 200, true, 'Turno eliminado exitosamente', turnos);
};

module.exports = { getTurnos, createTurno, deleteTurno };