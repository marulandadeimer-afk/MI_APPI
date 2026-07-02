const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Registro de usuario
router.post('/register', register);

// Inicio de sesión
router.post('/login', login);

// Obtener perfil del usuario autenticado (protegida)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;