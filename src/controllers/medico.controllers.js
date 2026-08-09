const Medico = require('../models/Medico');
const respuestaEstandar = require('../utils/respuestaEstandar');

exports.crearMedico = async (req, res) => {
    try {
        const nuevo = await Medico.create(req.body);
        respuestaEstandar(res, 201, true, "Medico creado", nuevo);
    } catch (e) { respuestaEstandar(res, 400, false, "Error", e.message); }
};