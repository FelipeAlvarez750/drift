# Drift

Es una aplicación de gestión de tareas estilo Kanban, construida con un stack full stack moderno. Permite a los usuarios organizar su trabajo en tableros con columnas personalizables, crear y editar tareas, marcarlas como completadas y cambiar entre tema claro y oscuro.

---

## Tecnologías

**Frontend**
- React 19 con TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Sileo (notificaciones)
- React Router DOM
- Axios

**Backend**
- Node.js con Express y TypeScript
- Prisma ORM v7
- SQL Server
- JSON Web Tokens (JWT)
- bcryptjs

---

## Funcionalidades

- Registro e inicio de sesión con autenticación JWT
- Creación, edición y eliminación de tableros
- Columnas por defecto: Por hacer, En progreso, Hecho
- Creación, edición y eliminación de tareas
- Marcar tareas como completadas con efecto tachado
- Tema claro y oscuro con persistencia en localStorage
- Notificaciones con animaciones de física
- Validación de formularios en el cliente
- Confirmación antes de eliminar elementos

---

## Estructura del proyecto

```
drift/
├── client/                  # Frontend React + TypeScript
│   └── src/
│       ├── components/      # Componentes reutilizables
│       ├── context/         # Contextos de autenticación y tema
│       ├── pages/           # Páginas principales
│       └── services/        # Configuración de Axios
└── server/                  # Backend Node.js + Express
    ├── prisma/              # Esquema y migraciones de base de datos
    └── src/
        ├── controllers/     # Lógica de negocio por entidad
        ├── middlewares/     # Verificación de tokens JWT
        └── routes/          # Definición de rutas de la API
```

---

## Instalación local

### Requisitos previos

- Node.js 18 o superior
- SQL Server (Express o superior)
- SQL Server Management Studio (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/FelipeAlvarez750/drift.git
cd drift
```

### 2. Configurar el backend

```bash
cd server
npm install
```

Crear el archivo `.env` en la carpeta `server/`:

```env
DATABASE_URL="sqlserver://localhost:1433;database=drift_db;integratedSecurity=true;trustServerCertificate=true"
JWT_SECRET="drift_secret_key_2026"
PORT=3001
```

Crear la base de datos en SQL Server:

```sql
CREATE DATABASE drift_db;
```

Ejecutar las migraciones:

```bash
npx prisma migrate dev
npx prisma generate
```

Iniciar el servidor:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd ../client
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Endpoints de la API

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registrar nuevo usuario |
| POST | /api/auth/login | Iniciar sesión |

### Tableros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/boards | Obtener tableros del usuario |
| POST | /api/boards | Crear tablero |
| PUT | /api/boards/:id | Actualizar nombre del tablero |
| DELETE | /api/boards/:id | Eliminar tablero |

### Columnas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/columns | Crear columna |
| PUT | /api/columns/:id | Actualizar columna |
| DELETE | /api/columns/:id | Eliminar columna |

### Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/tasks | Crear tarea |
| PUT | /api/tasks/:id | Actualizar tarea |
| PATCH | /api/tasks/:id/move | Mover tarea de columna |
| PATCH | /api/tasks/:id/complete | Alternar estado completado |
| DELETE | /api/tasks/:id | Eliminar tarea |

---

## Modelo de base de datos

```
User
  id, name, email, password, createdAt

Board
  id, name, userId, createdAt

Column
  id, name, order, boardId

Task
  id, title, description, order, completed, columnId, createdAt
```

---

## Autor

Felipe Patiño Alvarez  
GitHub: [FelipeAlvarez750](https://github.com/FelipeAlvarez750)
