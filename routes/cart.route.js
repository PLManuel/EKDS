import { Router } from 'express';
import {
  agregarAlCarrito,
  eliminarDetalleCarrito,
  finalizarCompra,
  obtenerCarritoID,
  obtenerCarritoUsuario,
  obtenerProductosCarrito
} from '../controllers/cart.controller.js';

const router = Router();

router.post('/', agregarAlCarrito);
router.get('/carrito-usuario', obtenerCarritoID);
router.get('/:carritoID/productos', obtenerProductosCarrito);
router.put('/:carritoID/finalizar', finalizarCompra);
router.delete('/eliminar/:detalleID', eliminarDetalleCarrito);
router.get('/:usuarioID', obtenerCarritoUsuario);

export default router;
