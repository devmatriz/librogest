import { Router } from 'express';
import * as ctrl from '../controllers/autores.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { proteger, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', validarId, ctrl.obtener);

router.post('/', proteger, soloAdmin, ctrl.crear);
router.put('/:id', validarId, proteger, soloAdmin, ctrl.actualizar);
router.delete('/:id', validarId, proteger, soloAdmin, ctrl.eliminar);

export default router;
