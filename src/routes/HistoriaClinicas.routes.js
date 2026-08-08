const express = require('express');
const router = express.Router();
const { getHistoriaClinicas, createHistoriaClinica, deleteHistoriaClinica } = require('../controllers/HistoriaClinica.controller'); 

router.get('/', getHistoriasClinicas);
router.post('/', createHistoriaClinica);
router.delete('/:id', deleteHistoriaClinica);

module.exports = router; 