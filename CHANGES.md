# Cambios realizados para agregar JWT y protección de rutas

## 1. Dependencias instaladas

```
npm install jsonwebtoken bcryptjs
```

- **jsonwebtoken**: Para generar y verificar tokens JWT
- **bcryptjs**: Para hashear contraseñas de forma segura

---

## 2. Archivo modificado: `models/user.model.js`

### Lo que se agregó:
- **`bcrypt`**: importado para el hash de contraseñas
- **Campo `password`**: de tipo String, requerido, mínimo 6 caracteres
- **Campo `role`**: de tipo String, valores permitidos `user` o `admin`, valor por defecto `user`
- **Hook `pre('save')`**: antes de guardar un usuario, si la contraseña fue modificada, la hashea automáticamente con `bcrypt.genSalt(10)` y `bcrypt.hash()`
- **Método `comparePassword`**: permite comparar una contraseña en texto plano con el hash almacenado
- **Método `toJSON`**: al convertir el documento a JSON, elimina el campo `password` para no exponerlo en las respuestas

### Código agregado:
```javascript
const bcrypt = require('bcryptjs');

// En el schema:
password: { type: String, required: true, minlength: 6 },
role: { type: String, enum: ['user', 'admin'], default: 'user' }

// Hook para hashear:
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar:
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Ocultar password en JSON:
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};
```

---

## 3. Archivo modificado: `middleware/auth.middleware.js`

### Lo que se cambió:
Antes tenía un middleware de prueba que solo verificaba un token hardcodeado.

Ahora tiene **dos middlewares**:

#### `authMiddleware`
- Toma el header `Authorization` con formato `Bearer <token>`
- Si no viene el header → responde `401` con mensaje "Token de autenticación requerido"
- Si el formato es inválido → responde `401`
- Verifica el token con `jwt.verify(token, process.env.JWT_SECRET)`
- Si el token expiró → responde `401` con mensaje específico
- Si el token es inválido → responde `401`
- Si es válido, guarda los datos del token en `req.user` y llama a `next()`

#### `adminMiddleware`
- Verifica que `req.user.role` sea `"admin"`
- Si no lo es → responde `403` con mensaje "Acceso denegado. Se requiere rol de administrador"

### Código nuevo:
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticación requerido' });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido. Use: Bearer <token>' });
    }
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado, inicie sesión nuevamente' });
        }
        return res.status(401).json({ message: 'Token inválido' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
```

---

## 4. Archivo nuevo: `controllers/auth.controller.js`

### Lo que hace:
Controlador con 3 funciones para autenticación:

#### `generateToken(user)`
- Función interna que genera un JWT con `{ id, email, role }` usando `process.env.JWT_SECRET`
- El token expira en 7 días (`expiresIn: '7d'`)

#### `register`
- Recibe `name`, `email`, `password` del body
- Valida que todos los campos estén presentes
- Verifica que el email no exista ya en la base de datos
- Crea el usuario con `User.create()` (el hook `pre('save')` hashea la contraseña automáticamente)
- Genera un token y responde con `{ message, token, user }`

#### `login`
- Recibe `email`, `password` del body
- Valida que ambos campos estén presentes
- Busca el usuario por email
- Compara la contraseña usando `user.comparePassword()`
- Si coincide, genera un token y responde con `{ message, token, user }`

#### `getProfile`
- Usa `req.user.id` (inyectado por el middleware) para buscar el usuario en la BD
- Devuelve los datos del usuario sin la contraseña

---

## 5. Archivo nuevo: `routes/auth.routes.js`

### Lo que hace:
Define las rutas públicas y protegidas de autenticación:

```javascript
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/register', register);       // Pública
router.post('/login', login);             // Pública
router.get('/profile', authMiddleware, getProfile);  // Protegida con JWT

module.exports = router;
```

---

## 6. Archivo modificado: `routes/user.routes.js`

### Lo que se cambió:
Antes no tenía protección. Ahora:

```javascript
// GET /api/users       → requiere authMiddleware (cualquier usuario autenticado)
// POST /api/users      → requiere authMiddleware + adminMiddleware (solo admin)
// PUT /api/users/:id   → requiere authMiddleware + adminMiddleware (solo admin)
// DELETE /api/users/:id → requiere authMiddleware + adminMiddleware (solo admin)
```

Esto significa que:
- **Cualquier usuario logueado** puede listar usuarios (`GET`)
- **Solo administradores** pueden crear, actualizar o eliminar usuarios

---

## 7. Archivo modificado: `index.js`

### Lo que se cambió:
Se importaron y registraron las rutas de autenticación:

```javascript
const authRoutes = require('./routes/auth.routes');

// Antes de las rutas de users:
app.use('/api/auth', authRoutes);

// Las rutas de users se mantienen:
app.use('/api/users', userRoutes);
```

---

## 8. Archivo nuevo: `API_DOCS.md`

Documentación completa con todos los endpoints, ejemplos de peticiones y respuestas, lista para usar en Insomnia.

---

## Resumen de cambios

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `models/user.model.js` | ✅ Modificado | Agregados password, role, hash, comparePassword, toJSON |
| `middleware/auth.middleware.js` | ✅ Reescrito | authMiddleware (JWT) + adminMiddleware (roles) |
| `controllers/auth.controller.js` | 🆕 Creado | register, login, getProfile con generación de JWT |
| `routes/auth.routes.js` | 🆕 Creado | Rutas públicas y protegidas de autenticación |
| `routes/user.routes.js` | ✅ Modificado | Agregada protección con authMiddleware y adminMiddleware |
| `index.js` | ✅ Modificado | Importadas y registradas rutas de auth |
| `package.json` | ✅ Actualizado | Dependencias jsonwebtoken y bcryptjs agregadas |
| `.env` | ✅ Ya tenía | JWT_SECRET ya estaba configurado |

## Flujo de autenticación

```
1. POST /api/auth/register  →  Crea usuario + devuelve token JWT
2. POST /api/auth/login     →  Verifica credenciales + devuelve token JWT
                                       ↓
3. GET /api/auth/profile    →  (con Bearer token) Devuelve datos del usuario
4. GET /api/users           →  (con Bearer token) Lista usuarios
5. POST /api/users          →  (con Bearer token + rol admin) Crea usuario
6. PUT /api/users/:id       →  (con Bearer token + rol admin) Actualiza usuario
7. DELETE /api/users/:id    →  (con Bearer token + rol admin) Elimina usuario