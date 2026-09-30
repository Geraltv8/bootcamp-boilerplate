import { Router } from 'express';
import { getTurnos, createTurno, deleteTurno, marcarAtendido } from './turnos.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware'
import { CrearTurnoSchema } from './dtos/turno.schema';
import { validarJWT } from '../../middlewares/validarJWT.middleware';

const router = Router();

router.get('/', validarJWT, getTurnos);
router.post('/', validarSchema(CrearTurnoSchema), createTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id', marcarAtendido);

export default router;