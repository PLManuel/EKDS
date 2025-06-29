import { Router } from 'express';
import {
  crearProducto,
  obtenerTodos,
  obtenerPorId,
  eliminarProducto,
  actualizarProducto,
  actualizarEstado,
  filtrarProductos,
  buscarProductos,
  reabastecer,
  verificarProducto
} from '../controllers/product.controller.js';

const router = Router();

router.post('/crear', crearProducto);
router.post('/reabastecer', reabastecer);
router.post('/verificar', verificarProducto);
router.get('/filtrar', filtrarProductos);
router.get('/buscar', buscarProductos);
router.get('/', obtenerTodos);
router.delete('/:id', eliminarProducto);
router.put('/update/:id', actualizarProducto);
router.put('/:id/estado', actualizarEstado);
router.get('/:id', obtenerPorId);

export default router;
