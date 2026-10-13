import { Router } from 'express';
import { registrarIngreso } from './recepcion.controller.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { registrarIngresoSchema } from './dtos/Recepcion.schema.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { Rol } from '../auth/Usuario.model.js';

const router = Router();

router.post('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(registrarIngresoSchema), registrarIngreso);

export default router;