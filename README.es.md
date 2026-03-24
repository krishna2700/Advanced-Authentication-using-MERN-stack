# Autenticación Avanzada usando MERN Stack

Una aplicación full-stack de autenticación construida con MongoDB, Express, React y Node.js, que incluye capacidades avanzadas de autenticación de usuarios y una utilidad de Seguimiento de Diferencias de Git para la gestión del flujo de trabajo de desarrollo.

## Características

### Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Cifrado seguro de contraseñas con bcryptjs
- Autenticación basada en JWT con cookies
- Integración con base de datos MongoDB
- Arquitectura API RESTful

### Seguimiento de Diferencias de Git
- **Preservación automática** de diferencias de git (no se requiere intervención manual)
- **Hooks de Git** guardan diferencias en cada commit
- **Observador en segundo plano** guarda automáticamente cada 5 minutos
- Acceso a historial de diferencias mediante CLI y API REST
- Limpieza automática de diferencias antiguas
- Compara cambios en diferentes puntos en el tiempo
- Exporta historial de diferencias a JSON

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
│   │   └── gitDiff.route.js      # Endpoints de diferencias de git
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Lógica principal de seguimiento de diferencias
│   │   └── diffCli.js            # Interfaz CLI
│   └── index.js                  # Punto de entrada del servidor
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentación detallada del seguimiento de diferencias
```

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
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

# Opcional: Configurar el observador de diferencias (valores predeterminados mostrados)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

**¡El Seguimiento de Diferencias de Git se iniciará automáticamente y preservará tus cambios!**

## Inicio Rápido - Preservación de Diferencias

Una vez que el servidor esté en ejecución, tus diferencias de git se preservan automáticamente mediante:

1. **Observador automático** - Guarda cada 5 minutos
2. **Hooks de Git** - Guarda en cada commit
3. **Guardados manuales** - Usa `npm run diff:save` en cualquier momento

### Recuperar Diferencias Perdidas

```bash
# Ver tu última diferencia guardada
npm run diff:last

# Ver todas las diferencias recientes
npm run diff:history

# Comparar actual vs anterior
npm run diff:compare
```

Consulta [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) para la documentación completa.

## Endpoints de la API

### Rutas de Autenticación (`/api/auth`)

Los endpoints de autenticación manejan el registro de usuarios, inicio de sesión y gestión de sesiones.

### Rutas de Diferencias de Git (`/api/git-diff`)

#### `GET /api/git-diff/current`
Obtiene la diferencia actual de git (cambios preparados y no preparados)

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
Guarda la diferencia actual de git en el historial

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
  "message": "Diferencia guardada exitosamente",
  "filepath": "/ruta/al/diff/guardado.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Obtiene el historial de diferencias (predeterminado: 10 entradas más recientes)

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Obtiene la diferencia guardada más recientemente

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
Compara la diferencia actual con la diferencia guardada anterior

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
Exporta todo el historial de diferencias a un archivo JSON

**Respuesta:**
```json
{
  "success": true,
  "message": "Historial exportado",
  "filepath": "./export.json"
}
```

## CLI del Seguimiento de Diferencias de Git

El Seguimiento de Diferencias de Git incluye una interfaz de línea de comandos para acceso rápido al historial de diferencias.

### Comandos CLI

```bash
# Guardar diferencia actual
node backend/utils/diffCli.js save

# Guardar diferencia con ID de tarea
node backend/utils/diffCli.js save task-123

# Mostrar diferencia actual
node backend/utils/diffCli.js current

# Mostrar historial de diferencias (predeterminado: 10 entradas)
node backend/utils/diffCli.js history

# Mostrar más historial
node backend/utils/diffCli.js history 20

# Mostrar última diferencia guardada
node backend/utils/diffCli.js last

# Comparar diferencia actual y anterior
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

También puedes usar el Seguimiento de Diferencias de Git de forma programática en tu código Node.js:

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Obtener diferencia actual
const current = await gitDiffTracker.getCurrentDiff();

// Guardar diferencia actual
const filepath = await gitDiffTracker.saveDiff('mi-tarea');

// Obtener historial
const history = await gitDiffTracker.getDiffHistory(10);

// Obtener última diferencia
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
- **bcryptjs** - Cifrado de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cookie-parser** - Análisis de cookies
- **dotenv** - Variables de entorno
- **mailtrap** - Integración de servicio de correo electrónico

### Desarrollo
- **nodemon** - Recarga automática durante el desarrollo

## Almacenamiento y Gestión de Datos

### Datos de Autenticación
- Las credenciales de usuario se almacenan en MongoDB
- Las contraseñas se cifran usando bcryptjs
- Los JWT se usan para la gestión de sesiones

### Historial de Diferencias de Git
- Las diferencias se almacenan en `.git/diff-history/`
- Se mantienen un máximo de 50 diferencias (limpieza automática)
- Los archivos se nombran: `diff-{timestamp}-task-{taskId}.json`
- El directorio está excluido de git a través de `.gitignore`

## Flujo de Trabajo de Desarrollo

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. El servidor se ejecutará en el puerto especificado en tu archivo `.env`

3. Usa los endpoints de autenticación para la gestión de usuarios

4. Usa el seguimiento de diferencias de git para preservar el historial de cambios durante el desarrollo

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=tu-clave-secreta-aqui
```

## Beneficios del Seguimiento de Diferencias de Git

1. **Sin Cambios Perdidos** - Siempre tienes acceso a diferencias anteriores
2. **Seguimiento de Cambios** - Rastrea qué cambió entre tareas
3. **Depuración** - Identifica cuándo se hicieron cambios específicos
4. **Historial** - Revisa la progresión del trabajo a lo largo del tiempo
5. **Recuperación** - Recupera información perdida si la diferencia desaparece

## Configuración Avanzada

### Tamaño de Historial Personalizado

Modifica `maxHistorySize` en `backend/utils/gitDiffTracker.js`:

```javascript
constructor() {
  this.maxHistorySize = 100; // Mantener 100 diferencias en lugar de 50
}
```

### Integración de Hooks de Git

Agrega a `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"
```

Hazlo ejecutable:
```bash
chmod +x .git/hooks/pre-commit
```

## Solución de Problemas

### Problemas de Autenticación
- Asegúrate de que MongoDB esté en ejecución y accesible
- Verifica que el archivo `.env` contenga las credenciales correctas
- Comprueba que JWT_SECRET esté configurado

### Problemas del Seguimiento de Diferencias de Git

**¿No se guardan diferencias?**
- Asegúrate de estar en un repositorio git
- Verifica que git esté instalado y accesible

**¿No puedes acceder al historial?**
- Verifica que el directorio `.git/diff-history/` exista
- Comprueba los permisos de archivo

**¿Demasiadas diferencias antiguas?**
- El seguimiento mantiene automáticamente solo las últimas 50
- Puedes limpiar manualmente: `rm -rf .git/diff-history/*`

## Licencia

ISC

## Documentación Adicional

- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** - Guía completa para la preservación automática de diferencias (¡empieza aquí!)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** - Referencia de API y detalles del Seguimiento de Diferencias de Git

## Contribuir

Este proyecto es parte de un sistema de autenticación avanzada. Las contribuciones deben mantener los estándares de seguridad y seguir la estructura de código existente.
