import { Router } from 'express';
import { kardexPorCategoria } from '../controllers/report.controller.js';

const router = Router();

router.get('/kardex', kardexPorCategoria);

export default router;