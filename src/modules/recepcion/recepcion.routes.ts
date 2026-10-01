import { Router } from 'express';
import { registrarIngreso } from './recepcion.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { registrarIngresoSchema } from './dtos/Recepcion.schema';
import { verificarRol } from '../../middlewares/verificarRol.middleware';
import { validarJWT } from '../../middlewares/validarJWT.middleware';
import { Rol } from '../auth/Usuario.model';

const router = Router();

router.post('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(registrarIngresoSchema), registrarIngreso);

export default router;