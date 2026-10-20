import { Router } from 'express';
import * as ctrl from '../controllers/libros.controller.js';
import * as valoraciones from '../controllers/valoraciones.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { proteger, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', validarId, ctrl.obtener);

router.post('/', proteger, soloAdmin, ctrl.crear);
router.put('/:id', validarId, proteger, soloAdmin, ctrl.actualizar);
router.delete('/:id', validarId, proteger, soloAdmin, ctrl.eliminar);

router.post('/:id/valoraciones', validarId, proteger, valoraciones.valorar);
router.delete('/:id/valoraciones/:valoracionId', validarId, proteger, valoraciones.eliminarValoracion);

export default router;
