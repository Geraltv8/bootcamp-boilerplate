import { Router } from 'express';
import { registrarUsuario, loginUsuario, loginCiudadano } from './auth.controller.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from './Usuario.model.js';
import { loginCiudadanoSchema, loginPersonalSchema, registrarUsuarioSchema } from './dtos/Auth.schema.js';

const router = Router();

router.post('/register', validarJWT, verificarRol(Rol.ADMIN), validarSchema(registrarUsuarioSchema), registrarUsuario);
router.post('/login', validarSchema(loginPersonalSchema), loginUsuario);
router.post('/ciudadano-login', validarSchema(loginCiudadanoSchema), loginCiudadano);

export default router;