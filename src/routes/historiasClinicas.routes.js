const express = require('express');
const router = express.Router();
const {
    getHistoriasClinicas,
    getHistoriaClinicaPorId,
    createHistoriaClinica,
    updateHistoriaClinica,
    deleteHistoriaClinica,
} = require('../controllers/historiasClinicas.controller');

router.get('/', getHistoriasClinicas);
router.get('/:id', getHistoriaClinicaPorId);
router.post('/', createHistoriaClinica);
router.put('/:id', updateHistoriaClinica);
router.delete('/:id', deleteHistoriaClinica);

module.exports = router;
