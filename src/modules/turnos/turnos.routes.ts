import { Router } from 'express';
import { getTurnos, createTurno, deleteTurno, marcarAtendido } from './turnos.controller.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js'
import { CrearTurnoSchema } from './dtos/turno.schema.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';

const router = Router();

router.get('/', validarJWT, getTurnos);
router.post('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(CrearTurnoSchema), createTurno);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), deleteTurno);
router.patch('/:id',validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), marcarAtendido);

export default router;