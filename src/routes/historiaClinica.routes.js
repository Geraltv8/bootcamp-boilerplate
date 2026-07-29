const express = require('express');
const router = express.Router();
const { getHistoriasClinicas, getHistoriaClinicaById, createHistoriaClinica } = require('../controllers/historiaClinica.controller');   

router.get('/', getHistoriasClinicas);
router.get('/:id', getHistoriaClinicaById);
router.post('/', createHistoriaClinica);

module.exports = router;