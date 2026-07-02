# Documentación de la API

## Configuración en Insomnia

1. Abre Insomnia
2. Crea una nueva colección: `mi-api`
3. Para cada request, configura:
   - **Base URL**: `http://localhost:3000`

---

## Autenticación

### 1. REGISTRO - Crear cuenta

Registra un nuevo usuario y devuelve un token JWT.

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "Deimer Marulanda",
    "email": "deimer@example.com",
    "password": "123456"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "name": "Deimer Marulanda",
      "email": "deimer@example.com",
      "role": "user",
      "_id": "6a45c05276678562ebfecad7",
      "createdAt": "2026-07-02T01:35:14.032Z",
      "updatedAt": "2026-07-02T01:35:14.032Z"
    }
  }
  ```
- **Errores:**
  - `400` - Todos los campos son obligatorios
  - `400` - El email ya está registrado

---

### 2. LOGIN - Iniciar sesión

Inicia sesión y devuelve un token JWT.

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "deimer@example.com",
    "password": "123456"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "message": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "6a45c05276678562ebfecad7",
      "name": "Deimer Marulanda",
      "email": "deimer@example.com",
      "role": "user",
      "createdAt": "2026-07-02T01:35:14.032Z",
      "updatedAt": "2026-07-02T01:35:14.032Z"
    }
  }
  ```
- **Errores:**
  - `401` - Credenciales inválidas

---

### 3. PERFIL - Obtener datos del usuario autenticado

Requiere token JWT. Devuelve los datos del usuario dueño del token.

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/auth/profile`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Respuesta exitosa:**
  ```json
  {
    "_id": "6a45c05276678562ebfecad7",
    "name": "Deimer Marulanda",
    "email": "deimer@example.com",
    "role": "user",
    "createdAt": "2026-07-02T01:35:14.032Z",
    "updatedAt": "2026-07-02T01:35:14.032Z"
  }
  ```

---

## Gestión de Usuarios (protegidas)

### 4. LISTAR usuarios

Obtiene todos los usuarios. Requiere autenticación.

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/users`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Respuesta:**
  ```json
  [
    {
      "_id": "6a45c05276678562ebfecad7",
      "name": "Deimer Marulanda",
      "email": "deimer@example.com",
      "role": "user",
      "createdAt": "2026-07-02T01:35:14.032Z",
      "updatedAt": "2026-07-02T01:35:14.032Z"
    }
  ]
  ```

---

### 5. CREAR usuario

Crea un nuevo usuario. Requiere rol de **admin**.

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/users`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "name": "María García",
    "email": "maria@example.com",
    "password": "123456"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "_id": "7b56d16387789673fc0fdbd8",
    "name": "María García",
    "email": "maria@example.com",
    "role": "user",
    "createdAt": "2026-07-02T01:40:00.000Z",
    "updatedAt": "2026-07-02T01:40:00.000Z"
  }
  ```
- **Errores:**
  - `403` - Acceso denegado. Se requiere rol de administrador

---

### 6. ACTUALIZAR usuario

Actualiza los datos de un usuario por ID. Requiere rol de **admin**.

- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/users/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "name": "Deimer Marulanda Actualizado",
    "email": "deimer.nuevo@example.com"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "_id": "6a45c05276678562ebfecad7",
    "name": "Deimer Marulanda Actualizado",
    "email": "deimer.nuevo@example.com",
    "role": "user",
    "createdAt": "2026-07-02T01:35:14.032Z",
    "updatedAt": "2026-07-02T01:40:30.000Z"
  }
  ```
- **Errores:**
  - `403` - Acceso denegado. Se requiere rol de administrador
  - `404` - Usuario no encontrado

---

### 7. ELIMINAR usuario

Elimina un usuario por ID. Requiere rol de **admin**.

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/users/:id`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Respuesta exitosa:**
  ```json
  {
    "message": "Usuario eliminado correctamente"
  }
  ```
- **Errores:**
  - `403` - Acceso denegado. Se requiere rol de administrador
  - `404` - Usuario no encontrado

---

## Resumen rápido para Insomnia

| # | Método | URL | Auth | Body |
|---|--------|-----|------|------|
| 1 | POST | `/api/auth/register` | ❌ | `{ name, email, password }` |
| 2 | POST | `/api/auth/login` | ❌ | `{ email, password }` |
| 3 | GET | `/api/auth/profile` | ✅ Bearer token | - |
| 4 | GET | `/api/users` | ✅ Bearer token | - |
| 5 | POST | `/api/users` | ✅ Bearer token (admin) | `{ name, email, password }` |
| 6 | PUT | `/api/users/:id` | ✅ Bearer token (admin) | `{ name, email }` |
| 7 | DELETE | `/api/users/:id` | ✅ Bearer token (admin) | - |

### Tips para Insomnia:
1. Crea una **Environment Variable** en Insomnia:
   - `base_url`: `http://localhost:3000`
   - `token`: (lo obtienes del register/login)
2. Usa `{{base_url}}` en las URLs y `Bearer {{token}}` en los headers
3. Para los endpoints que requieren admin, necesitas un usuario con `role: "admin"`. Puedes crearlo directamente en MongoDB o modificando temporalmente el role en la base de datos.