const express = require('express');
const router = express.Router();
const { crearHistoria } = require('../controllers/historiaClinica.controllers');

router.post('/', crearHistoria);

module.exports = router;