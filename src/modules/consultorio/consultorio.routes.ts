import { Router } from 'express';
import { createConsultorio, deleteConsultorio, getConsultorios } from './consultorio.controller';
import { crearConsultorioSchema } from './dtos/Consultorio.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getConsultorios);
router.post('/', validarSchema(crearConsultorioSchema), createConsultorio);
router.delete('/:id', deleteConsultorio);

export default router;
