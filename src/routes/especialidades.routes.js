const express = require('express');
const router = express.Router();
const {
    getEspecialidades,
    getEspecialidadPorId,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
} = require('../controllers/especialidades.controller');

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadPorId);
router.post('/', createEspecialidad);
router.put('/:id', updateEspecialidad);
router.delete('/:id', deleteEspecialidad);

module.exports = router;
