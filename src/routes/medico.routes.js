const express = require('express');
const router = express.Router();
const { crearMedico } = require('../controllers/medico.controllers');

router.post('/', crearMedico);

module.exports = router;