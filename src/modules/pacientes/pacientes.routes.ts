import { Router } from 'express';
import { createPaciente, deletePaciente, getPacientes } from './pacientes.controller.js';
import { crearPacienteSchema } from './dtos/Paciente.schema.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';

const router = Router();

router.get('/', getPacientes);
router.post('/', validarSchema(crearPacienteSchema), createPaciente);
router.delete('/:id', deletePaciente);

export default router;