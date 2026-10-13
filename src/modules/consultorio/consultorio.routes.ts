import { Router } from 'express';
import { createConsultorio, deleteConsultorio, getConsultorios } from './consultorio.controller.js';
import { crearConsultorioSchema } from './dtos/Consultorio.schema.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';

const router = Router();

router.get('/', getConsultorios);
router.post('/', validarSchema(crearConsultorioSchema), createConsultorio);
router.delete('/:id', deleteConsultorio);

export default router;
