import { Router } from 'express';
import { getTurnos, createTurno, deleteTurno, marcarAtendido } from './turnos.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware'
import { CrearTurnoSchema } from './dtos/turno.schema';
import { validarJWT } from '../../middlewares/validarJWT.middleware';
import { verificarRol } from '../../middlewares/verificarRol.middleware';
import { Rol } from '../auth/Usuario.model';

const router = Router();

router.get('/', validarJWT, getTurnos);
router.post('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(CrearTurnoSchema), createTurno);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), deleteTurno);
router.patch('/:id',validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), marcarAtendido);

export default router;