# Spec Técnica: Módulo de Médicos (Backend)

## 1. Contexto y Objetivos
Desarrollar el módulo central para la gestión del personal médico del sistema municipal. Este módulo expone una API REST para realizar operaciones CRUD sobre la entidad `Medico`. Se requiere validación estricta, protección por roles y manejo de integridad referencial con las entidades `Usuario` y `Turno`.

## 2. Modelo de Datos (Entidad Dominio)
La entidad `Medico` debe contener las siguientes propiedades lógicas:
- **usuarioId**: Referencia obligatoria a la cuenta de autenticación (Entidad Usuario).
- **nombre**: Cadena de texto, mínimo 2 caracteres.
- **apellido**: Cadena de texto, mínimo 2 caracteres.
- **matricula**: Cadena de texto alfanumérica, obligatoria y única en toda la base de datos (Índice único).
- **especialidades**: Arreglo de cadenas (mínimo 1 elemento). Debe estar validado contra un catálogo o Enum oficial del sistema.
- **telefono**: Cadena de texto, opcional.
- **activo**: Booleano, valor por defecto: verdadero.

## 3. Endpoints de la API

### A. Listar Médicos
- **Ruta:** GET `/api/v1/medicos`
- **Permisos:** Recepcionista, Admin, Médico.
- **Filtros (Query Params):** `especialidad` (opcional), `activo` (opcional, booleano), `busqueda` (opcional, busca por nombre/apellido parcial).
- **Salida Exitosa:** Status 200. Lista paginada o completa de médicos (excluyendo datos sensibles de usuario).

### B. Obtener Detalle de Médico
- **Ruta:** GET `/api/v1/medicos/:id`
- **Permisos:** Recepcionista, Admin, Médico.
- **Validación:** Validar que el parámetro `id` sea un identificador de base de datos válido.
- **Salida Exitosa:** Status 200. Objeto completo del médico populando el email de su entidad Usuario.
- **Salida Error:** Status 404 si no existe.

### C. Crear Médico
- **Ruta:** POST `/api/v1/medicos`
- **Permisos:** Solo Admin.
- **Cuerpo (Body):** Requiere `usuarioId`, `nombre`, `apellido`, `matricula`, `especialidades`, `telefono`.
- **Salida Exitosa:** Status 201. Objeto creado.
- **Errores Esperados:** 
  - Status 400 por fallos de validación del esquema.
  - Status 409 (Conflicto) si la matrícula ya se encuentra registrada.

### D. Actualizar Médico (Parcial)
- **Ruta:** PATCH `/api/v1/medicos/:id`
- **Permisos:** Solo Admin (para cualquier campo), Médico (solo puede actualizar su propio teléfono).
- **Cuerpo (Body):** Mismos campos que el POST, pero todos opcionales.
- **Salida Exitosa:** Status 200. Objeto actualizado.

### E. Eliminar (Borrado Lógico)
- **Ruta:** DELETE `/api/v1/medicos/:id`
- **Permisos:** Solo Admin.
- **Lógica:** No se debe borrar el registro de la base de datos física. Se debe cambiar la propiedad `activo` a falso.
- **Salida Exitosa:** Status 200.

## 4. Reglas de Negocio Estrictas
1. **Validación DTO:** Todas las peticiones entrantes deben pasar por un esquema de validación estructural (Zod) antes de tocar el controlador.
2. **Atomicidad:** Si en un futuro se permite crear la cuenta de `Usuario` y el perfil de `Medico` en la misma petición POST, es de uso obligatorio una Transacción de Base de Datos.
3. **Restricción de Borrado:** Si el médico tiene turnos asignados en estado 'PENDIENTE' a futuro, la operación de borrado lógico (DELETE) debe ser rechazada con un Status 400 informando que debe reasignar o cancelar los turnos primero.