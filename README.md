# Bootcamp Boilerplate - Ecosistema Salita Municipal (Trabajo Grupal)

API REST para el ecosistema de una salita municipal, desarrollada en equipo como tarea grupal del bootcamp ("Open Source Flow": fork del repo del profe, trabajo por ramas `feature/` y PRs a `develop`).

## Equipo (Room3)

- Juan Gabriel Pared — Medico, Especialidad
- Ivan Barbona — HistoriaClinica (fork original del repo)
- Bautista Capovila — Consultorio
- Emilio Sarchetti

## Stack

- Node.js + Express 5
- MongoDB + Mongoose
- dotenv, ESLint, nodemon

## Estructura

```
src/
  models/       # Schemas de Mongoose (Turno, Paciente, Medico, Especialidad, Consultorio, HistoriaClinica)
  controllers/  # Lógica de cada recurso
  routes/       # Definición de endpoints
  middlewares/  # Auditoría, manejo de errores
  utils/        # Helpers (respuesta estándar de la API)
```

## Cómo correrlo

1. Instalar dependencias:
   ```
   npm install
   ```
2. Crear un archivo `.env` en la raíz con:
   ```
   DATABASE_URL=<connection string de MongoDB>
   PORT=3000
   ENTORNO=Local
   ```
3. Levantar el servidor en modo desarrollo:
   ```
   npm run dev
   ```

## Endpoints

| Recurso | Ruta base |
|---|---|
| Turnos | /api/v1/turnos |
| Pacientes | /api/v1/pacientes |
| Medicos | /api/v1/medicos |
| Especialidades | /api/v1/especialidades |
| Consultorios | /api/v1/consultorios |
| Historias Clínicas | /api/v1/historiaclinicas |

Todos los recursos exponen operaciones CRUD (GET, POST y, según el recurso, PUT/DELETE) siguiendo el mismo patrón: respuesta estándar (`success`, `message`, `data`), soft-delete con el campo `activo` y validaciones de Mongoose.
