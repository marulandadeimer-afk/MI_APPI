const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Obtener todos los usuarios (protegido - cualquier usuario autenticado)
router.get('/', authMiddleware, getUsers);

// Crear un nuevo usuario (protegido - solo admin)
router.post('/', authMiddleware, adminMiddleware, createUser);

// Actualizar un usuario por ID (protegido - solo admin)
router.put('/:id', authMiddleware, adminMiddleware, updateUser);

// Eliminar un usuario por ID (protegido - solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
