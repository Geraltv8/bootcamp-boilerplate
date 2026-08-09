const express = require('express');
const router = express.Router();
const { crearConsultorio } = require('../controllers/consultorio.controllers');

router.post('/', crearConsultorio);

module.exports = router;