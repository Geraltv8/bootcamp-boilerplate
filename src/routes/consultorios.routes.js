const express = require('express');
const router = express.Router();
const { getConsultorios, createConsultorio, deleteConsultorio } = require('../controllers/consultorios.controller');

router.get('/', getConsultorios);
router.post('/', createConsultorio);
router.delete('/:id', deleteConsultorio);

module.exports = router;
