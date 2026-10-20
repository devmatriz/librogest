import { Router } from 'express';
import * as ctrl from '../controllers/pedidos.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { proteger, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(proteger);

router.post('/', ctrl.crear);
router.get('/mios', ctrl.misPedidos);
router.get('/', soloAdmin, ctrl.listar);
router.get('/:id', validarId, ctrl.obtener);
router.post('/:id/cancelar', validarId, ctrl.cancelar);
router.patch('/:id/estado', validarId, soloAdmin, ctrl.cambiarEstado);

export default router;
