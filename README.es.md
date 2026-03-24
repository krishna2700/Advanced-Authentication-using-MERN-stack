# Autenticación Avanzada usando MERN Stack

Una aplicación full-stack de autenticación construida con MongoDB, Express, React y Node.js, que incluye capacidades avanzadas de autenticación de usuarios y una utilidad de seguimiento de Git Diff para la gestión del flujo de trabajo de desarrollo.

## Características

### Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Hash seguro de contraseñas con bcryptjs
- Autenticación basada en JWT con cookies
- Integración con base de datos MongoDB
- Arquitectura de API RESTful

### Rastreador de Git Diff
- **Preservación automática** de diffs de git (sin intervención manual necesaria)
- **Git hooks** guardan diffs en cada commit
- **Observador en segundo plano** auto-guarda cada 5 minutos
- Acceso a historial de diffs mediante CLI y API REST
- Limpieza automática de diffs antiguos
- Comparación de cambios entre diferentes puntos en el tiempo
- Exportación de historial de diffs a JSON

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
│   │   ├── auth.route.js         # Endpoints de autenticación
│   │   └── gitDiff.route.js      # Endpoints de git diff
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Lógica central de seguimiento de diffs
│   │   └── diffCli.js            # Interfaz de línea de comandos
│   └── index.js                  # Punto de entrada del servidor
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentación detallada del rastreador de git diff
```

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd advanced-authentication-using-mern-stack
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear un archivo `.env` en el directorio raíz:
```env
PORT=5000
MONGO_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta_jwt

# Opcional: Configurar el observador de diffs (valores por defecto mostrados)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

**¡El Rastreador de Git Diff se iniciará automáticamente y preservará tus cambios!**

## Inicio Rápido - Preservación de Diffs

Una vez que el servidor está ejecutándose, tus diffs de git se preservan automáticamente mediante:

1. **Observador automático** - Guarda cada 5 minutos
2. **Git hooks** - Guarda en cada commit
3. **Guardados manuales** - Usa `npm run diff:save` en cualquier momento

### Recuperar Diffs Perdidos

```bash
# Ver tu último diff guardado
npm run diff:last

# Ver todos los diffs recientes
npm run diff:history

# Comparar actual vs anterior
npm run diff:compare
```

Consulta [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) para la documentación completa.

## Endpoints de la API

### Rutas de Autenticación (`/api/auth`)

Los endpoints de autenticación manejan el registro de usuarios, inicio de sesión y gestión de sesiones.

### Rutas de Git Diff (`/api/git-diff`)

#### `GET /api/git-diff/current`
Obtener el diff de git actual (cambios preparados y sin preparar)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-28T17:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Mensaje del commit",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

#### `POST /api/git-diff/save`
Guardar el diff de git actual en el historial

**Cuerpo de la Solicitud:**
```json
{
  "taskId": "task-123"  // opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Diff guardado exitosamente",
  "filepath": "/ruta/al/diff/guardado.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Obtener historial de diffs (por defecto: 10 entradas más recientes)

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Obtener el diff guardado más recientemente

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
Comparar el diff actual con el diff guardado anterior

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
Exportar todo el historial de diffs a un archivo JSON

**Respuesta:**
```json
{
  "success": true,
  "message": "Historial exportado",
  "filepath": "./export.json"
}
```

## CLI del Rastreador de Git Diff

El Rastreador de Git Diff incluye una interfaz de línea de comandos para acceso rápido al historial de diffs.

### Comandos CLI

```bash
# Guardar diff actual
node backend/utils/diffCli.js save

# Guardar diff con ID de tarea
node backend/utils/diffCli.js save task-123

# Mostrar diff actual
node backend/utils/diffCli.js current

# Mostrar historial de diffs (por defecto: 10 entradas)
node backend/utils/diffCli.js history

# Mostrar más historial
node backend/utils/diffCli.js history 20

# Mostrar último diff guardado
node backend/utils/diffCli.js last

# Comparar diff actual y anterior
node backend/utils/diffCli.js compare

# Exportar historial a JSON
node backend/utils/diffCli.js export ./mis-diffs.json
```

### Casos de Uso

**Antes de completar una tarea:**
```bash
node backend/utils/diffCli.js save antes-de-refactorizar
```

**Después de hacer cambios:**
```bash
node backend/utils/diffCli.js compare
```

**Revisar qué cambió:**
```bash
node backend/utils/diffCli.js last
```

## Uso Programático

También puedes usar el Rastreador de Git Diff programáticamente en tu código Node.js:

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Obtener diff actual
const current = await gitDiffTracker.getCurrentDiff();

// Guardar diff actual
const filepath = await gitDiffTracker.saveDiff('mi-tarea');

// Obtener historial
const history = await gitDiffTracker.getDiffHistory(10);

// Obtener último diff
const last = await gitDiffTracker.getLastDiff();

// Comparar con anterior
const comparison = await gitDiffTracker.compareWithPrevious();

// Exportar historial
await gitDiffTracker.exportDiffHistory('./export.json');
```

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework de aplicación web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - Modelado de objetos MongoDB
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cookie-parser** - Análisis de cookies
- **dotenv** - Variables de entorno
- **mailtrap** - Integración de servicio de correo

### Desarrollo
- **nodemon** - Recarga automática durante el desarrollo

## Almacenamiento y Gestión de Datos

### Datos de Autenticación
- Las credenciales de usuario se almacenan en MongoDB
- Las contraseñas se hashean usando bcryptjs
- Los JWT se usan para gestión de sesiones

### Historial de Git Diff
- Los diffs se almacenan en `.git/diff-history/`
- Se mantienen máximo 50 diffs (limpieza automática)
- Los archivos se nombran: `diff-{timestamp}-task-{taskId}.json`
- El directorio está excluido de git mediante `.gitignore`

## Flujo de Trabajo de Desarrollo

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. El servidor se ejecutará en el puerto especificado en tu archivo `.env`

3. Usa los endpoints de autenticación para gestión de usuarios

4. Usa el rastreador de git diff para preservar el historial de cambios durante el desarrollo

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=tu-clave-secreta-aqui
```

## Beneficios del Rastreador de Git Diff

1. **Sin Cambios Perdidos** - Siempre tienes acceso a diffs anteriores
2. **Seguimiento de Cambios** - Rastrea qué cambió entre tareas
3. **Depuración** - Identifica cuándo se hicieron cambios específicos
4. **Historial** - Revisa la progresión del trabajo a lo largo del tiempo
5. **Recuperación** - Recupera información perdida si el diff desaparece

## Configuración Avanzada

### Tamaño de Historial Personalizado

Modifica `maxHistorySize` en `backend/utils/gitDiffTracker.js`:

```javascript
constructor() {
  this.maxHistorySize = 100; // Mantener 100 diffs en lugar de 50
}
```

### Integración con Git Hook

Agrega a `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"
```

Hacer ejecutable:
```bash
chmod +x .git/hooks/pre-commit
```

## Solución de Problemas

### Problemas de Autenticación
- Asegúrate de que MongoDB esté ejecutándose y sea accesible
- Verifica que el archivo `.env` contenga las credenciales correctas
- Comprueba que JWT_SECRET esté configurado

### Problemas del Rastreador de Git Diff

**¿No se guardan diffs?**
- Asegúrate de estar en un repositorio git
- Verifica que git esté instalado y sea accesible

**¿No puedes acceder al historial?**
- Verifica que el directorio `.git/diff-history/` exista
- Comprueba los permisos de archivos

**¿Demasiados diffs antiguos?**
- El rastreador mantiene automáticamente solo los últimos 50
- Puedes limpiar manualmente: `rm -rf .git/diff-history/*`

## Licencia

ISC

## Documentación Adicional

- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** - Guía completa para preservación automática de diffs (¡comienza aquí!)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** - Referencia de la API del Rastreador de Git Diff y detalles

## Contribuciones

Este proyecto es parte de un sistema de autenticación avanzada. Las contribuciones deben mantener los estándares de seguridad y seguir la estructura de código existente.
