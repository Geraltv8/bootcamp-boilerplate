import { Router } from 'express';
import { registrarIngreso } from './recepcion.controller';

const router = Router();

router.post('/', registrarIngreso);

export default router;