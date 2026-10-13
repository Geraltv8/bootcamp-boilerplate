import { Router } from 'express';
import { analizarHistorial } from './ia.controller.js';

const router = Router();

router.post('/analizar', analizarHistorial);

export default router;
