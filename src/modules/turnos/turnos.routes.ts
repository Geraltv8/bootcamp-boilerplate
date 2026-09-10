import { Router } from 'express';
import { getTurnos, createTurno, deleteTurno, marcarAtendido } from './turnos.controller';

const router = Router();

router.get('/', getTurnos);
router.post('/', createTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id', marcarAtendido);

export default router;