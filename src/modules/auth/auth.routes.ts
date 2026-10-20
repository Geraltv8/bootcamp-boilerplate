import { Router } from 'express';
import { registrarUsuario, loginUsuario, loginCiudadano } from './auth.controller.js';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/ciudadano-login', loginCiudadano);

export default router;