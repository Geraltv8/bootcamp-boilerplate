import { Router } from 'express';
import { createPaciente, deletePaciente, getPacientes } from './pacientes.controller';

const router = Router();

router.get('/', getPacientes);
router.post('/', createPaciente);
router.delete('/:id', deletePaciente);

export default router;