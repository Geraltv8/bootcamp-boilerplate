const express = require('express');
const router = express.Router();
const { getMedicos, createMedico, deleteMedico} = require('../controllers/medicos.controller.js');

router.get('/', getMedicos);
router.post('/', createMedico);
router.delete('/:id', deleteMedico);  

module.exports = router;