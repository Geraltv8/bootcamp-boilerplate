const express = require('express');
const router = express.Router();
const {
    getConsultorios,
    getConsultorioPorId,
    createConsultorio,
    updateConsultorio,
    deleteConsultorio,
} = require('../controllers/consultorios.controller');

router.get('/', getConsultorios);
router.get('/:id', getConsultorioPorId);
router.post('/', createConsultorio);
router.put('/:id', updateConsultorio);
router.delete('/:id', deleteConsultorio);

module.exports = router;
