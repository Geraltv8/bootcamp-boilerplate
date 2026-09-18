import { Router } from 'express';
import { createPaciente, deletePaciente, getPacientes } from './pacientes.controller';
import { crearPacienteSchema } from './dtos/Paciente.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getPacientes);
router.post('/', validarSchema(crearPacienteSchema), createPaciente);
router.delete('/:id', deletePaciente);

export default router;