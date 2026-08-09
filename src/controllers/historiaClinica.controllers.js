const HistoriaClinica = require('../models/HistoriaClinica');
const respuestaEstandar = require('../utils/respuestaEstandar');

exports.crearHistoria = async (req, res) => {
    try {
        const nueva = await HistoriaClinica.create(req.body);
        respuestaEstandar(res, 201, true, "Historia creada", nueva);
    } catch (e) { respuestaEstandar(res, 400, false, "Error", e.message); }
};