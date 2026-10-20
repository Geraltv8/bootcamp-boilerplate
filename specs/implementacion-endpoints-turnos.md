# Spec de API: implementación de requisitos funcionales de turnos

## 1. Propósito y alcance

Este documento especifica los endpoints que faltan y los endpoints existentes que deben modificarse para alinear la API con [Requisitos-Funcionales.md](../Requisitos-Funcionales.md).

El alcance es el backend Express/Mongoose existente. Los requisitos de interfaz de usuario de los módulos 5 y 6 se traducen aquí en contratos que el frontend necesita consumir; la construcción del wizard, los indicadores de carga, los calendarios y la persistencia de formularios no forma parte de este spec.

Se conservan la organización modular existente, los DTO y esquemas Zod, los middlewares compartidos y el formato de respuesta `respuestaEstandar(res, status, ok, message, data)`. Las rutas nuevas deben seguir el prefijo `/api/v1`.

## 2. Convenciones y reglas comunes

- Los endpoints protegidos requieren `Authorization: Bearer <JWT>`. La ausencia o invalidez del token responde `401`; un rol insuficiente responde `403`.
- Roles funcionales: `PACIENTE` (equivalente a CIUDADANO), `RECEPCIONISTA` y `ADMIN`. El rol `MEDICO` puede mantenerse si es necesario para las funciones existentes, pero no sustituye ninguno de los tres roles requeridos.
- Validar body, params y query exclusivamente con Zod antes de ejecutar la lógica de negocio.
- Los errores de validación responden `400`; recursos inexistentes `404`; conflictos de disponibilidad, duplicados o límites de negocio `409`; operaciones prohibidas por la política del dominio `403` o `400`, según se indique en cada endpoint.
- No exponer hashes, contraseñas ni datos innecesarios de cuentas en las respuestas.
- No permitir que un usuario elija un rol privilegiado enviándolo desde una ruta pública. La creación, activación y asignación de roles de personal es una operación administrativa.
- Las fechas de la API se interpretan en UTC: `YYYY-MM-DD` representa el día UTC y las reservas requieren una fecha ISO con offset explícito. La aplicación persiste instantes consistentes y no mezcla días locales con fechas UTC.

## 3. Estado actual y brechas principales

| Área | Situación actual | Trabajo requerido |
|---|---|---|
| Autenticación | Existe login de personal y de ciudadano, pero sus contratos y validaciones deben ajustarse; el login del personal exige `user` además de email y contraseña. | Usar email y contraseña para personal; validar ambas variantes con Zod; impedir registro público con rol arbitrario. |
| Especialidades | Las especialidades están definidas en enums estáticos; no existe CRUD del catálogo. | Crear recurso persistente con CRUD administrativo y baja lógica. |
| Agendas | No existe recurso ni endpoint de agenda. | Crear agenda recurrente por médico, prevenir incoherencias y solapamientos. |
| Disponibilidad | Existe una comprobación aislada de disponibilidad con duración fija; no expone horarios libres calculados desde agendas. | Implementar consulta por especialidad, médico opcional y fecha, usando duración de agenda y turnos existentes. |
| Turnos | El listado no filtra por usuario, fecha ni día; la creación está restringida a ADMIN/RECEPCIONISTA; no verifica ventana de 30 días ni límite por especialidad. | Añadir reserva ciudadana, “mis turnos”, dashboard diario, reglas de ventana y límite, cancelación propia y estados completos. |
| Estados | Existe una actualización rápida a ATENDIDO y CANCELADO, pero no una operación de AUSENTE ni transiciones restringidas. | Validar las transiciones y separar las acciones del paciente de las de recepción. |
| Pacientes | El CRUD está abierto y la baja elimina físicamente; el modelo exige información que el login ciudadano no recopila. | Proteger rutas, impedir borrado físico, añadir búsqueda segura por DNI y admitir alta de baja fricción. |
| Recepción | Existe un endpoint transaccional que crea paciente y turno juntos, pero no busca pacientes por DNI ni usa la reserva normalizada. | Reutilizar pacientes existentes y habilitar búsqueda y otorgamiento presencial de turnos. |
| Consultorios | El CRUD no está protegido consistentemente y los turnos no tienen asignación de consultorio. | Restringir gestión a ADMIN y decidir/implementar la asociación turno-consultorio necesaria para mostrar el detalle al ciudadano. |

## 4. Autenticación, autorización y pacientes

### 4.1 Personal

#### `POST /api/v1/auth/login`

- **Acceso:** público.
- **Body:** `{ "email": string, "password": string }`.
- **Comportamiento:** buscar una cuenta activa por email, comparar la contraseña con bcrypt y emitir JWT con identidad y rol.
- **Respuesta exitosa:** `200`, `{ token, usuario: { id, email, rol } }`.
- **Errores:** `400` por body inválido; `401` para credenciales incorrectas o cuenta inactiva.
- No diferenciar en el mensaje de error si el email existe.

### 4.2 Ciudadano

#### `POST /api/v1/auth/ciudadano-login`

- **Acceso:** público.
- **Body:** `{ "dni": string, "telefono": string }`.
- **Comportamiento:** normalizar el teléfono de forma consistente. Si el DNI existe, comparar el teléfono registrado y rechazar discrepancias con `401`. Si el paciente no existe, crear un registro mínimo y emitir JWT con rol `PACIENTE`.
- **Respuesta exitosa:** `200`, `{ token, paciente: { id, dni, ... } }`; nunca devolver datos sensibles de terceros.
- **Validación:** DNI y teléfono requeridos y con formato válido; un DNI existente con teléfono distinto nunca debe generar otra cuenta.
- El alta automática debe ser compatible con el esquema del paciente sin inventar datos clínicos. Los campos desconocidos pueden ser opcionales o representarse como datos no informados, según la migración del modelo.

### 4.3 Gestión de usuarios de personal

#### `POST /api/v1/auth/register` (modificar)

- **Acceso:** solo `ADMIN`.
- **Body:** datos de cuenta y rol permitido para personal; `password` se almacena únicamente como hash bcrypt.
- Rechazar la asignación de `ADMIN` si el actor no es administrador.
- Si se conserva la creación inicial de un administrador, debe definirse un mecanismo de bootstrap fuera de una ruta pública abierta.

### 4.4 Perfil y búsqueda de pacientes

#### `GET /api/v1/pacientes` (modificar)

- **Acceso:** `ADMIN` y `RECEPCIONISTA`; búsqueda puntual de un paciente también disponible en recepción.
- **Query:** `dni` opcional, además de los filtros administrativos existentes.
- Validar parámetros con Zod, devolver coincidencias mínimas necesarias y no listar datos clínicos a roles que no los requieran.

#### `GET /api/v1/pacientes/me`

- **Acceso:** `PACIENTE`.
- **Comportamiento:** obtener exclusivamente el perfil asociado al `id` del token.
- No aceptar DNI o ID de paciente como selector de identidad.

#### `DELETE /api/v1/pacientes/:id` (modificar o retirar)

- No realizar borrado físico. Si se necesita una baja administrativa, implementar baja lógica con autorización `ADMIN`, preservando turnos e historial; de lo contrario, retirar el endpoint.
- El paciente no puede borrar su propia identidad a través de esta ruta.

## 5. Especialidades y médicos (ADMIN)

### 5.1 Catálogo de especialidades

Crear módulo siguiendo la estructura actual (`model`, `controller`, `routes`, `dtos` y tipos).

| Método y ruta | Rol | Función |
|---|---|---|
| `GET /api/v1/especialidades` | `PACIENTE`, `RECEPCIONISTA`, `ADMIN` | Listar especialidades activas para el wizard. |
| `GET /api/v1/especialidades/:id` | `ADMIN` | Obtener detalle, incluyendo inactivas. |
| `POST /api/v1/especialidades` | `ADMIN` | Crear especialidad con nombre único normalizado y descripción opcional. |
| `PATCH /api/v1/especialidades/:id` | `ADMIN` | Actualizar parcialmente nombre/descripcion y estado según reglas de integridad. |
| `DELETE /api/v1/especialidades/:id` | `ADMIN` | Baja lógica; preservar asociaciones e historial. |

Los médicos, agendas y turnos deben referenciar el catálogo o usar una estrategia de transición que evite divergencias con los enums actuales. No permitir baja de una especialidad con agendas/turnos activos sin una política explícita de migración o desactivación.

### 5.2 Médicos existentes

Mantener las rutas existentes de [medicos.routes.ts](../src/modules/medicos/medicos.routes.ts) con estos ajustes:

- `GET /api/v1/medicos`: mantener filtros de búsqueda; por defecto mostrar solo médicos activos para selección de turno. `ADMIN` puede pedir inactivos.
- `GET /api/v1/medicos/:id`: validar ObjectId y mostrar detalle sin datos sensibles.
- `POST /api/v1/medicos`: solo `ADMIN`; garantizar unicidad de matrícula con índice único de base de datos y devolver `409` en duplicados.
- `PATCH /api/v1/medicos/:id`: solo `ADMIN` para datos administrativos; si se conserva el permiso `MEDICO`, limitarlo al teléfono del perfil autenticado y verificar pertenencia.
- `DELETE /api/v1/medicos/:id`: baja lógica; nunca borrar físicamente. No ofrecer médicos inactivos en nuevas reservas.
- Alinear el DTO con los datos funcionales obligatorios (nombre, apellido, matrícula y especialidad/es). Si la cuenta vinculada (`usuarioId`) sigue siendo obligatoria por el modelo, especificar el flujo administrativo para crear/vincular esa cuenta de forma segura.

## 6. Agendas médicas y disponibilidad

### 6.1 Agendas

Crear módulo `agendas` con modelo, DTO Zod, controlador, rutas y servicios.

| Método y ruta | Rol | Función |
|---|---|---|
| `GET /api/v1/medicos/:medicoId/agendas` | `ADMIN`, `RECEPCIONISTA` | Listar agendas del médico, con filtro de activas. |
| `POST /api/v1/medicos/:medicoId/agendas` | `ADMIN` | Crear patrón semanal de disponibilidad. |
| `PATCH /api/v1/agendas/:id` | `ADMIN` | Actualizar día, inicio, fin, duración o estado. |
| `DELETE /api/v1/agendas/:id` | `ADMIN` | Baja lógica de una agenda. |

Campos mínimos: `medicoId`, `diaSemana` (lunes a domingo, con representación numérica documentada), `horaInicio`, `horaFin`, `duracionMinutos`, `activo`.

`diaSemana` utiliza la convención JavaScript UTC: `0` domingo, `1` lunes, ..., `6` sábado.

Validaciones:

1. Horas en formato `HH:mm` y `horaInicio < horaFin`.
2. Duración positiva y no mayor al bloque disponible; los bloques se generan en incrementos de la duración.
3. Médico existente y activo.
4. No permitir agendas activas del mismo médico que se solapen el mismo día. En actualizaciones, excluir la agenda que se está editando.
5. Agendas desactivadas no generan horarios disponibles.

### 6.2 Consulta dinámica de horarios libres

#### `GET /api/v1/turnos/disponibilidad`

- **Acceso:** público o `PACIENTE`; el endpoint no entrega datos de pacientes ni turnos.
- **Query requerida:** `especialidad`, `fecha` (`YYYY-MM-DD`).
- **Query opcional:** `medicoId`.
- **Comportamiento:** comprobar que la fecha no sea pasada ni exceda 30 días; encontrar médicos activos compatibles, obtener sus agendas para el día de semana solicitado, generar bloques según `duracionMinutos` y eliminar horarios con turnos activos en estados `PENDIENTE` o `ATENDIDO`.
- **Respuesta `200`:** lista ordenada de opciones `{ medicoId, medico, fechaHoraInicio, duracionMinutos }`. Si no hay disponibilidad, devolver lista vacía.
- La respuesta no debe incluir bloques fuera de la agenda ni espacios incompletos al final de un bloque.

## 7. Turnos

### 7.1 Crear una reserva ciudadana

#### `POST /api/v1/turnos`

- **Acceso:** `PACIENTE`; `RECEPCIONISTA` puede actuar en nombre de un ciudadano mediante el flujo presencial definido en la sección 8; `ADMIN` según necesidad operativa.
- **Body ciudadano:** `{ medicoId, especialidadId, fechaHoraInicio }`. El paciente se obtiene del JWT, no del body.
- **Comportamiento:** validar médico/especialidad/agenda activos, fecha dentro de los próximos 30 días y bloque todavía libre; asignar estado inicial `PENDIENTE`.
- **Límite anti-spam:** no crear si el paciente ya tiene dos turnos `PENDIENTE` de la misma especialidad; responder `409`.
- **Concurrencia:** la reserva debe ser atómica. Usar transacción de Mongoose para las operaciones implicadas y una garantía de exclusión efectiva en la base de datos para que dos solicitudes simultáneas no puedan confirmar el mismo médico/fecha/hora. Un chequeo previo de disponibilidad, por sí solo, no satisface el requisito. Responder `409` al perdedor de la contienda.
- **Estados:** ignorar/rechazar `estado` enviado por el ciudadano.

### 7.2 Consultar turnos

#### `GET /api/v1/turnos` (modificar)

- `PACIENTE`: listar solo sus turnos. No aceptar `pacienteId` como filtro de identidad.
- `RECEPCIONISTA` y `ADMIN`: filtrar por fecha, estado, médico y/o paciente según permisos.
- Soportar el dashboard del día con `fecha=YYYY-MM-DD`; resultados ordenados por fecha/hora ascendente.
- Validar filtros con Zod. Evitar que un listado ciudadano exponga turnos de otras personas.

#### `GET /api/v1/turnos/me`

- **Acceso:** `PACIENTE`.
- Listar sus próximos turnos `PENDIENTE`, ordenados cronológicamente, con fecha/hora y consultorio asignado cuando exista.
- El identificador de paciente proviene del token.

#### `GET /api/v1/turnos/:id` (sustituye el selector actual por query `?id=`)

- `PACIENTE`: solo si el turno pertenece al paciente autenticado.
- `RECEPCIONISTA` y `ADMIN`: según permisos de gestión.
- Responder `404` si no existe y `403` si existe pero no pertenece al ciudadano, o usar `404` uniforme para no revelar su existencia.

### 7.3 Cancelación

#### `PATCH /api/v1/turnos/:id/cancelacion`

- **Acceso:** `PACIENTE` para sus propios turnos; `RECEPCIONISTA`/`ADMIN` con política administrativa.
- El ciudadano solo puede cancelar sus turnos `PENDIENTE` y cuando falten al menos dos horas para el inicio.
- Validar pertenencia usando JWT y transición permitida; no confiar en un `pacienteId` del body.
- Si faltan menos de dos horas, el turno ya no está pendiente o no pertenece al usuario, rechazar con error claro (`403` o `409`).
- Marcar `CANCELADO`; preservar el registro histórico.

### 7.4 Gestión de estados en recepción

#### `PATCH /api/v1/turnos/:id/estado`

- **Acceso:** `RECEPCIONISTA` y `ADMIN`.
- Body limitado a `{ "estado": "ATENDIDO" | "AUSENTE" }` (o la representación actualmente acordada en el enum).
- Permitir la transición solo desde `PENDIENTE`; rechazar transiciones inválidas con `409`.
- Conservar `CANCELADO` como acción separada y no habilitar que un paciente marque `ATENDIDO` o `AUSENTE`.

El ciclo de vida permitido debe quedar centralizado y probado: creación `PENDIENTE`; desde `PENDIENTE`, pasar a `ATENDIDO`, `AUSENTE` o `CANCELADO`; ningún cambio arbitrario de estado desde el cliente.

### 7.5 Ventana temporal

- No aceptar reservas con inicio en el pasado.
- No devolver horarios disponibles ni permitir reservas para fechas a más de 30 días desde el momento de la consulta/reserva.
- Aplicar el límite en el servicio de dominio y no solo en el DTO o la interfaz.
- Definir si “30 días” significa días calendario o 30 períodos de 24 horas; hasta que el negocio indique otra cosa, usar días calendario en la zona horaria del servicio y documentarlo.

## 8. Recepción y operación presencial

### 8.1 Buscar paciente

#### `GET /api/v1/recepcion/pacientes?dni=<dni>`

- **Acceso:** `RECEPCIONISTA` y `ADMIN`.
- Búsqueda exacta de DNI, resultado mínimo de identificación y respuesta `404` cuando no exista.
- Validar DNI con Zod y no permitir búsquedas masivas no acotadas desde esta ruta.

### 8.2 Otorgar turno a un paciente

#### `POST /api/v1/recepcion/turnos`

- **Acceso:** `RECEPCIONISTA` y `ADMIN`.
- **Body:** `{ dni, medicoId, especialidadId, fechaHoraInicio }`.
- Resolver el paciente por DNI; no crear otro registro duplicado si ya existe.
- Aplicar disponibilidad, ventana de 30 días, límite de dos pendientes por especialidad y prevención de concurrencia igual que en reserva ciudadana.
- El servidor registra en auditoría al operador que ejecutó la acción.
- Si se requiere crear un paciente presencial nuevo, usar un flujo explícito de alta de paciente dentro de la transacción y solicitar los datos mínimos necesarios; no utilizar el endpoint actual para crear un paciente nuevo en cada otorgamiento.

### 8.3 Dashboard diario

Puede ser una consulta especializada o una variante de `GET /api/v1/turnos?fecha=hoy`; el contrato debe devolver todos los turnos del día, ordenados cronológicamente, con paciente, médico, especialidad, estado y consultorio necesarios para recepción. Restringir a `RECEPCIONISTA`/`ADMIN`.

## 9. Consultorios y asociación con turnos

El requisito “Mis Turnos” incluye el consultorio, pero los modelos actuales no representan una asociación entre turno y consultorio. Antes de exponer el dato:

1. Añadir una referencia opcional `consultorioId` a turno.
2. El consultorio puede quedar sin asignar; no se asigna automáticamente. Recepción/admin pueden asignarlo explícitamente al crear el turno presencial.
3. Incluir el consultorio en consultas del paciente y del dashboard cuando exista.
4. Restringir `POST`, actualización y baja de consultorios a `ADMIN`; permitir lectura solo a roles que la necesiten.
5. Mantener la baja lógica y validar IDs con Zod.

No asumir reglas de capacidad o simultaneidad del consultorio sin una decisión adicional de producto.

## 10. Contratos Zod y cambios de modelos

- Crear esquemas Zod independientes para cada operación y validar también `params` y `query`.
- Reemplazar cuerpos flexibles o campos incorrectamente nombrados por DTO explícitos. No aceptar `estado`, `paciente` o rol desde el cliente cuando deben derivarse de autenticación o negocio.
- Alinear los enums existentes de estados con los cuatro valores funcionales `PENDIENTE`, `ATENDIDO`, `CANCELADO`, `AUSENTE`, definiendo si los valores persistidos son mayúsculos o minúsculos y migrando datos sin perder historial.
- Añadir índices para DNI, matrícula y exclusión de reservas, verificando datos duplicados existentes antes de activar índices únicos.
- Antes de desplegar índices únicos, revisar y resolver duplicados históricos; preparar la cuenta ADMIN inicial fuera del endpoint público de registro.
- Adaptar el modelo de paciente para admitir registro ciudadano de DNI y teléfono sin contraseña y sin exigir datos clínicos ficticios.
- Preservar las relaciones e historial con bajas lógicas.

## 11. Criterios de aceptación y pruebas

1. Un ciudadano puede iniciar sesión con DNI/teléfono y recibe JWT `PACIENTE`; un teléfono incorrecto para un DNI existente recibe `401`.
2. Personal inicia sesión con email/contraseña bcrypt; una cuenta desactivada o credenciales inválidas no recibe token.
3. Un visitante no puede crear usuarios privilegiados, administrar médicos, agendas, especialidades o consultorios.
4. Agenda rechaza horarios invertidos, duración excesiva y cualquier solapamiento para médico/día.
5. Disponibilidad calcula bloques según la agenda y no presenta ocupados, médicos inactivos ni fechas fuera de ventana.
6. Dos solicitudes concurrentes por el mismo bloque producen exactamente una reserva y un `409`.
7. Un paciente no supera dos turnos pendientes de una misma especialidad.
8. Un paciente solo lista y cancela sus turnos; no puede cancelar con menos de dos horas.
9. Recepción consulta el día actual en orden cronológico, marca `ATENDIDO` o `AUSENTE` y crea turnos para pacientes identificados por DNI.
10. Los estados iniciales y transiciones cumplen la máquina definida y los endpoints no permiten saltarse reglas enviando campos manipulados.
11. Todas las entradas inválidas responden con el formato estándar y no producen escrituras parciales.
12. Los flujos que escriben en varias colecciones usan transacciones; las transacciones se abortan ante fallos y se libera siempre la sesión.
13. Pruebas de autorización cubren `401`, `403`, pertenencia del paciente y acceso administrativo por cada ruta.

## 12. Fuera de alcance de este spec

- Implementación visual del wizard mobile-first, skeletons/spinners y panel “Mis Turnos”.
- Calendario visual del dashboard administrativo.
- Persistencia de formularios con React Hook Form.
- Reglas de negocio no definidas para sobreturnos fuera de agenda, cupos por consultorio o asignación automática de consultorio.
