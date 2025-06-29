import { Router } from 'express';
import { login, logout, perfil, register, registerAdmin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/registerAdmin', registerAdmin);
router.post('/login', login);
router.get('/perfil', perfil);
router.get('/logout', logout);

export default router;
