# Autenticación Avanzada usando MERN Stack

Una aplicación de autenticación full-stack construida con MongoDB, Express, React y Node.js, con capacidades avanzadas de autenticación de usuarios y una utilidad de Git Diff Tracker para la gestión del flujo de trabajo de desarrollo.

## Características

### Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Hashing seguro de contraseñas con bcryptjs
- Autenticación basada en JWT con cookies
- Integración con base de datos MongoDB
- Arquitectura RESTful

### Git Diff Tracker
- **Preservación automática** de diffs de git (sin intervención manual)
- **Hooks de git** guardan diffs en cada commit
- **Watcher en segundo plano** guarda automáticamente cada 5 minutos
- Acceso CLI y REST API al historial de diffs
- Limpieza automática de diffs antiguos
- Comparar cambios en diferentes puntos del tiempo
- Exportar historial de diffs a JSON

## Estructura del Proyecto

```
.
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Lógica de autenticación
│   ├── db/
│   │   └── connectDB.js          # Conexión a MongoDB
│   ├── models/
│   │   └── user.model.js         # Esquema de usuario
│   ├── routes/
│   │   ├── auth.route.js         # Endpoints de auth
│   │   └── gitDiff.route.js      # Endpoints de git diff
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Lógica central del diff tracker
│   │   └── diffCli.js            # Interfaz CLI
│   └── index.js                  # Punto de entrada del servidor
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentación detallada del diff tracker
```

## Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd advanced-authentication-using-mern-stack
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en el directorio raíz:
```env
PORT=5000
MONGO_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta_jwt

# Opcional: Configurar el watcher de diffs (valores por defecto)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

**¡El Git Diff Tracker iniciará y preservará automáticamente tus cambios!**

## Inicio Rápido - Preservación de Diffs

Una vez que el servidor está en ejecución, tus diffs de git se preservan automáticamente mediante:

1. **Watcher automático** - Guarda cada 5 minutos
2. **Hooks de git** - Guarda en cada commit
3. **Guardados manuales** - Usa `npm run diff:save` cuando quieras

### Recuperar Diffs Perdidos

```bash
# Ver el último diff guardado
npm run diff:last

# Ver todos los diffs recientes
npm run diff:history

# Comparar actual vs anterior
npm run diff:compare
```

Consulta [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) para la documentación completa.

## Endpoints de API

### Rutas de Autenticación (`/api/auth`)

Los endpoints de autenticación gestionan el registro, inicio de sesión y la sesión del usuario.

### Rutas de Git Diff (`/api/git-diff`)

#### `GET /api/git-diff/current`
Obtiene el diff actual de git (cambios en staged y unstaged)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-28T17:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Commit message",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

#### `POST /api/git-diff/save`
Guarda el diff actual en el historial

**Cuerpo de la solicitud:**
```json
{
  "taskId": "task-123"  // opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Diff guardado con éxito",
  "filepath": "/path/to/saved/diff.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Obtiene el historial de diffs (por defecto: 10 entradas más recientes)

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Obtiene el diff guardado más reciente

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "timestamp": "...",
    "branch": "...",
    "lastCommit": "...",
    "stagedDiff": "...",
    "unstagedDiff": "..."
  }
}
```

#### `GET /api/git-diff/compare`
Compara el diff actual con el diff guardado anteriormente

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "current": {...},
    "previous": {...},
    "timeDifference": 123456
  }
}
```

#### `GET /api/git-diff/export?path=./export.json`
Exporta todo el historial de diffs a un archivo JSON

**Respuesta:**
```json
{
  "success": true,
  "message": "Historial exportado",
  "filepath": "./export.json"
}
```
