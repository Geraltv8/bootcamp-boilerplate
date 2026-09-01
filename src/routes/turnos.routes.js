const express = require('express');
const router = express.Router();
const { getTurnos, createTurno, deleteTurno, marcarAtendido } = require('../controllers/turnos.controller');

router.get('/', getTurnos);
router.post('/', createTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id', marcarAtendido);

module.exports = router;