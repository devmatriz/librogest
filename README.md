# LibroGest

Aplicación web para una librería: Node.js + Express + MongoDB (local) + React.

## Requisitos
- Node.js 20 o superior
- MongoDB 8 en local

## Puesta en marcha

1. Arrancar MongoDB (los datos se guardan fuera de OneDrive):
   ```powershell
   mongod --dbpath "$env:USERPROFILE\mongodb-data" --bind_ip 127.0.0.1
   ```
2. Backend:
   ```powershell
   cd backend
   npm install
   copy .env.example .env   # solo la primera vez
   npm run seed             # carga datos de prueba (borra los existentes)
   npm run dev              # API en http://localhost:4000
   ```
3. Comprobar: http://localhost:4000/api/salud
4. Frontend (en otra terminal):
   ```powershell
   cd frontend
   npm install
   npm run dev              # http://localhost:5173
   ```
   Vite redirige las peticiones `/api` al backend (puerto 4000), así que ambos deben estar en marcha.
   La moneda de los precios se configura en `frontend/src/config.js`.

## API

Acceso: 🌐 público · 👤 usuario con sesión · 🔒 solo admin.
Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | 🌐 | Registro (siempre como cliente); devuelve `token` |
| POST | `/api/auth/login` | 🌐 | Inicio de sesión; devuelve `token` |
| GET / PUT | `/api/auth/perfil` | 👤 | Ver / editar perfil (`passwordActual` + `passwordNueva` para cambiarla) |
| GET | `/api/libros` | 🌐 | Catálogo paginado con filtros |
| GET | `/api/libros/:id` | 🌐 | Detalle con autores, categoría y valoraciones |
| POST / PUT / DELETE | `/api/libros[/:id]` | 🔒 | Gestión de libros |
| POST | `/api/libros/:id/valoraciones` | 👤 | Valorar (1–5); si ya valoró, se actualiza |
| DELETE | `/api/libros/:id/valoraciones/:valoracionId` | 👤 | Borrar valoración propia (admin: cualquiera) |
| GET | `/api/autores?q=` | 🌐 | Autores (búsqueda por nombre) |
| GET | `/api/autores/:id` | 🌐 | Autor con sus libros |
| POST / PUT / DELETE | `/api/autores[/:id]` | 🔒 | Gestión de autores |
| GET | `/api/categorias[/:id]` | 🌐 | Categorías |
| POST / PUT / DELETE | `/api/categorias[/:id]` | 🔒 | Gestión de categorías (slug automático) |

Parámetros de `GET /api/libros`:
`q` (búsqueda de texto), `categoria` (id o slug), `autor` (id), `min`, `max`,
`disponibles=true`, `orden` (`recientes`, `titulo`, `precio_asc`, `precio_desc`, `valoracion`),
`page`, `limit` (máx. 50).

Ejemplo: `/api/libros?q=historia&categoria=ciencia&orden=precio_asc&page=1&limit=10`

No se puede eliminar un autor o una categoría que tenga libros asociados (responde 409).

## Usuarios de prueba
| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@librogest.com | admin123 |
| cliente | cliente@librogest.com | cliente123 |
