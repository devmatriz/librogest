import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { proteger } from '../middlewares/auth.js';

const router = Router();

router.post('/register', ctrl.registrar);
router.post('/login', ctrl.login);
router.get('/perfil', proteger, ctrl.perfil);
router.put('/perfil', proteger, ctrl.actualizarPerfil);

export default router;
