const express = require('express');
const router = express.Router();
const { getTurnos, createTurno, deleteTurno, crearTurnoAsistencia } = require('../controllers/turnos.controller');

router.get('/', getTurnos);
router.get('/asistencia', crearTurnoAsistencia);
router.post('/', createTurno);
router.delete('/:id', deleteTurno);

module.exports = router;