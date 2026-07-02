# Cómo cambiar el tiempo de expiración del token JWT

Actualmente el token expira en **7 días**. Aquí te explico las formas de cambiarlo.

---

## Método 1: Cambiar directamente en el código (rápido)

Abre el archivo `controllers/auth.controller.js` y busca la función `generateToken`:

```javascript
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // ← Aquí se define la expiración
    );
};
```

Cambia `'7d'` por el valor que quieras:

| Valor | Significado |
|-------|-------------|
| `'60'` o `'60s'` | 60 segundos |
| `'5m'` | 5 minutos |
| `'2h'` | 2 horas |
| `'1d'` | 1 día |
| `'7d'` | 7 días (valor actual) |
| `'30d'` | 30 días |
| `'1y'` | 1 año |
| `'0'` | Nunca expira (no recomendado) |

Ejemplo para que expire en **1 hora**:

```javascript
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};
```

Después de cambiarlo, reinicia el servidor:

```
Ctrl + C  (para detener el servidor)
node index.js  (para iniciarlo de nuevo)
```

---

## Método 2: Usar variable de entorno (recomendado)

Este método es mejor porque puedes cambiar la expiración sin tocar el código.

### Paso 1: Agregar la variable al `.env`

Abre el archivo `.env` y agrega una nueva línea:

```env
MONGO_URI=mongodb+srv://admin:1017932597@cluster0.ekhjkby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d       ← Agrega esta línea
PORT=3000
```

### Paso 2: Modificar el controlador para usar la variable

Abre `controllers/auth.controller.js` y modifica la función `generateToken`:

```javascript
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        //                           ↑ usa la variable del .env
        //                             Si no está definida, usa 7d por defecto
    );
};
```

### Paso 3: Cambiar la expiración cuando quieras

Ahora solo editas el `.env` y reinicias el servidor:

```env
JWT_EXPIRES_IN=1h    # Cambia a 1 hora
```

o

```env
JWT_EXPIRES_IN=30d   # Cambia a 30 días
```

Sin modificar ningún archivo de código.

---

## Cómo probar que funciona

### Opción 1: Con curl (terminal)

```bash
# 1. Inicia sesión y guarda el token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Opción 2: Con Insomnia

1. Haz login con `POST /api/auth/login`
2. Copia el token de la respuesta
3. Pégalo en [jwt.io](https://jwt.io) para ver los datos
4. Busca el campo `exp` — ahí verás la fecha de expiración en formato Unix timestamp

### Ver el error de token expirado

Si el token expiró, cualquier endpoint protegido responderá:

```json
{
  "message": "Token expirado, inicie sesión nuevamente"
}
```

Solo tienes que volver a hacer login para obtener un token nuevo.

---

## Valores comunes de expiración

| Caso de uso | Expiración recomendada |
|-------------|------------------------|
| Desarrollo / pruebas | `'7d'` o `'30d'` |
| App móvil | `'30d'` o `'90d'` |
| Web app (producción) | `'1h'` o `'24h'` |
| API bancaria/financiera | `'15m'` (15 minutos) |
| Token de recuperación | `'1h'` |

---

## Resumen

| Método | Dónde se cambia | Ventaja |
|--------|----------------|---------|
| Directo en código | `controllers/auth.controller.js` | Rápido, sin archivos extra |
| Variable de entorno | `.env` + `controllers/auth.controller.js` | Más flexible, no tocas código |

**Recomendación:** Usa el **Método 2** (variable de entorno) para producción, así puedes cambiar la expiración cuando necesites sin modificar el código.