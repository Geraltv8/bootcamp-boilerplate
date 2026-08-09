const express = require('express');
const router = express.Router();
const { crearEspecialidad } = require('../controllers/especialidad.controllers');

router.post('/', crearEspecialidad);

module.exports = router;