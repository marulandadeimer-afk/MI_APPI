# MI_APPI

API REST con Node.js, Express y MongoDB Atlas.

## Tecnologías

- **Node.js** + **Express**
- **MongoDB Atlas** (Mongoose ODM)
- **Autenticación JWT**
- **Bcryptjs** para encriptación de contraseñas

## Instalación

```bash
npm install
```

## Configuración

1. Crear archivo `.env` en la raíz del proyecto con las siguientes variables:

```
MONGO_URI=<tu_uri_de_mongodb_atlas>
JWT_SECRET=<tu_secreto_jwt>
JWT_EXPIRES_IN=7d
PORT=3000
```

## Ejecución

```bash
npm run dev
```

## Endpoints

| Método | Ruta               | Auth  | Descripción               |
|--------|--------------------|-------|---------------------------|
| POST   | /api/auth/register | ❌    | Registro de usuario       |
| POST   | /api/auth/login    | ❌    | Inicio de sesión          |
| GET    | /api/auth/profile  | ✅    | Perfil del usuario        |
| GET    | /api/users         | ✅    | Listar usuarios (admin)   |
| POST   | /api/users         | ✅    | Crear usuario (admin)     |
| PUT    | /api/users/:id     | ✅    | Actualizar usuario (admin)|
| DELETE | /api/users/:id     | ✅    | Eliminar usuario (admin)  |

## Documentación detallada

Ver [`API_DOCS.md`](./API_DOCS.md) para ejemplos de uso en Insomnia.