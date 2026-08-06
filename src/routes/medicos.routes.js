const express = require('express');
const router = express.Router();
const {
    getMedicos,
    getMedicoPorId,
    createMedico,
    updateMedico,
    deleteMedico,
} = require('../controllers/medicos.controller');

router.get('/', getMedicos);
router.get('/:id', getMedicoPorId);
router.post('/', createMedico);
router.put('/:id', updateMedico);
router.delete('/:id', deleteMedico);

module.exports = router;
