import { Router } from 'express';
import { registrarUsuario, loginUsuario } from './auth.controller.js';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

export default router;