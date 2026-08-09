const Consultorio = require('../models/Consultorio');
const respuestaEstandar = require('../utils/respuestaEstandar');

exports.crearConsultorio = async (req, res) => {
    try {
        const nuevo = await Consultorio.create(req.body);
        respuestaEstandar(res, 201, true, "Consultorio creado", nuevo);
    } catch (e) { respuestaEstandar(res, 400, false, "Error", e.message); }
};