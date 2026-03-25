# Autenticación Avanzada usando MERN Stack

Una aplicación full-stack de autenticación construida con MongoDB, Express, React y Node.js, con capacidades avanzadas de autenticación de usuarios y una utilidad de seguimiento de Git Diff para la gestión del flujo de trabajo de desarrollo.

## Características

### Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Hash seguro de contraseñas con bcryptjs
- Autenticación basada en JWT con cookies
- Integración con base de datos MongoDB
- Arquitectura API RESTful

### Rastreador de Git Diff
- **Preservación automática** de git diffs (no se necesita intervención manual)
- **Git hooks** guardan diffs en cada commit
- **Observador en segundo plano** guarda automáticamente cada 5 minutos
- Acceso por CLI y API REST al historial de diffs
- Limpieza automática de diffs antiguos
- Comparar cambios entre diferentes puntos en el tiempo
- Exportar historial de diffs a JSON

## Estructura del Proyecto

```
.
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Lógica de autenticación
│   ├── db/
│   │   └── connectDB.js          # Conexión MongoDB
│   ├── models/
│   │   └── user.model.js         # Esquema de usuario
│   ├── routes/
│   │   ├── auth.route.js         # Endpoints de autenticación
│   │   └── gitDiff.route.js      # Endpoints de git diff
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Lógica central del rastreador
│   │   └── diffCli.js            # Interfaz CLI
│   └── index.js                  # Punto de entrada del servidor
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentación detallada del rastreador
```

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
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

# Opcional: Configurar observador de diffs (valores predeterminados mostrados)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

**¡El rastreador de Git Diff se iniciará automáticamente y preservará tus cambios!**

## Inicio Rápido - Preservación de Diffs

Una vez que el servidor esté ejecutándose, tus git diffs se preservan automáticamente a través de:

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

Los endpoints de autenticación gestionan el registro de usuarios, inicio de sesión y gestión de sesiones.

### Rutas de Git Diff (`/api/git-diff`)

#### `GET /api/git-diff/current`
Obtener el diff actual de git (cambios staged y unstaged)

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
Guardar el diff actual de git en el historial

**Cuerpo de la Petición:**
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
Obtener historial de diffs (predeterminado: 10 entradas más recientes)

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

El rastreador de Git Diff incluye una interfaz de línea de comandos para acceso rápido al historial de diffs.

### Comandos CLI

```bash
# Guardar diff actual
node backend/utils/diffCli.js save

# Guardar diff con ID de tarea
node backend/utils/diffCli.js save task-123

# Mostrar diff actual
node backend/utils/diffCli.js current

# Mostrar historial de diffs (predeterminado: 10 entradas)
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

También puedes usar el rastreador de Git Diff programáticamente en tu código Node.js:

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

// Comparar con el anterior
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
- **mailtrap** - Integración de servicio de correo electrónico

### Desarrollo
- **nodemon** - Recarga automática durante el desarrollo

## Almacenamiento y Gestión de Datos

### Datos de Autenticación
- Las credenciales de usuario se almacenan en MongoDB
- Las contraseñas se hashean usando bcryptjs
- Los JWT se usan para la gestión de sesiones

### Historial de Git Diff
- Los diffs se almacenan en `.git/diff-history/`
- Se mantienen máximo 50 diffs (limpieza automática)
- Los archivos se nombran: `diff-{timestamp}-task-{taskId}.json`
- El directorio se excluye de git mediante `.gitignore`

## Flujo de Trabajo de Desarrollo

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. El servidor se ejecutará en el puerto especificado en tu archivo `.env`

3. Usar los endpoints de autenticación para la gestión de usuarios

4. Usar el rastreador de git diff para preservar el historial de cambios durante el desarrollo

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=tu-clave-secreta-aqui
```

## Beneficios del Rastreador de Git Diff

1. **Sin Pérdida de Cambios** - Siempre tienes acceso a diffs anteriores
2. **Seguimiento de Cambios** - Rastrear qué cambió entre tareas
3. **Depuración** - Identificar cuándo se hicieron cambios específicos
4. **Historial** - Revisar la progresión del trabajo a lo largo del tiempo
5. **Recuperación** - Recuperar información perdida si el diff desaparece

## Configuración Avanzada

### Tamaño de Historial Personalizado

Modificar `maxHistorySize` en `backend/utils/gitDiffTracker.js`:

```javascript
constructor() {
  this.maxHistorySize = 100; // Mantener 100 diffs en lugar de 50
}
```

### Integración con Git Hooks

Agregar a `.git/hooks/pre-commit`:

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
- Asegurar que MongoDB esté ejecutándose y sea accesible
- Verificar que el archivo `.env` contenga las credenciales correctas
- Comprobar que JWT_SECRET esté configurado

### Problemas del Rastreador de Git Diff

**¿No se guardan diffs?**
- Asegurar que estés en un repositorio git
- Comprobar que git esté instalado y accesible

**¿No puedes acceder al historial?**
- Verificar que el directorio `.git/diff-history/` exista
- Comprobar los permisos de archivos

**¿Demasiados diffs antiguos?**
- El rastreador automáticamente mantiene solo los últimos 50
- Puedes limpiar manualmente: `rm -rf .git/diff-history/*`

## Licencia

ISC

## Documentación Adicional

- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** - Guía completa para la preservación automática de diffs (¡comienza aquí!)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** - Referencia API y detalles del rastreador de Git Diff

## Contribuciones

Este proyecto es parte de un sistema de autenticación avanzada. Las contribuciones deben mantener los estándares de seguridad y seguir la estructura de código existente.
