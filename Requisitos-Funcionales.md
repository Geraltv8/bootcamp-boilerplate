# REQUISITOS FUNCIONALES SISTEMAS DE TURNOS.
## Módulo 1: Autenticación, Autorización y Roles
- **RF-1.1** - Sistema de Roles: El sistema debe manejar al menos tres niveles de acceso: CIUDADANO (Paciente), RECEPCIONISTA (Gestión diaria) y ADMIN (Gestión de configuración y personal).

- **RF-1.2** - Autenticación de Ciudadanos (Baja Fricción): El ciudadano ingresará al sistema utilizando únicamente su número de DNI y su Teléfono. Si los datos coinciden con un registro existente, se emite su sesión (JWT). Si no existe, el sistema lo registra automáticamente en ese momento. No se utilizarán contraseñas.

- **RF-1.3** - Autenticación del Personal: Los Recepcionistas y Administradores ingresarán mediante Correo Electrónico y Contraseña encriptada, generando un JWT con validación de rol.

- **RF-1.4** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol necesario.

## Módulo 2: Gestión de Especialidades y Personal Médico (Solo ADMIN)
- **RF-2.1** - Catálogo de Especialidades: El sistema debe permitir crear, listar, modificar y dar de baja (borrado lógico) especialidades médicas (ej. Pediatría, Odontología).

- **RF-2.2** - Alta de Médicos: El sistema debe permitir registrar médicos. Los datos obligatorios son Nombre, Apellido, Matrícula Profesional y Especialidad/es asociada/s.

- **RF-2.3** - Unicidad de Matrícula: El sistema debe impedir la creación de dos médicos con el mismo número de matrícula.

- **RF-2.4** - Borrado Lógico: No se podrán eliminar médicos físicamente de la base de datos para preservar el historial. Se utilizará un estado activo: booleano. Si se inactiva, no aparecerá en la grilla de nuevos turnos.

## Módulo 3: Motor de Agendas Médicas (El Patrón de Disponibilidad)
- **RF-3.1** - Creación de Agendas: Un Administrador debe poder definir la disponibilidad de un médico indicando: Día de la semana (Lunes a Domingo), Hora de Inicio, Hora de Fin y Duración del Turno (en minutos, ej. 20 o 30 min).

- **RF-3.2** - Validación de Coherencia de Agenda: El sistema debe impedir crear una agenda donde la "Hora de Inicio" sea posterior a la "Hora de Fin", o donde la duración del turno sea mayor al bloque total disponible.

- **RF-3.3** - Solapamiento de Agendas Base: El sistema debe evitar que a un mismo médico se le asignen dos agendas que se superpongan en el mismo día y horario.

- **RF-3.4** - Cálculo Dinámico de Disponibilidad: Cuando un ciudadano consulte turnos, el Backend calculará los "bloques de tiempo" basándose en la agenda, buscará los turnos ya otorgados en la fecha solicitada, y restará los ocupados, devolviendo al Frontend solo el listado de horarios libres.

## Módulo 4: Gestión de Turnos (El Core)
- **RF-4.1** - Ciclo de Vida del Turno (Máquina de Estados): Un turno solo puede transitar por los siguientes estados: PENDIENTE, ATENDIDO, CANCELADO, AUSENTE. Todo turno nace como PENDIENTE.

- **RF-4.2** - Prevención de Concurrencia (Doble Reserva): Si dos ciudadanos intentan reservar el mismo turno (mismo médico, fecha y hora) exactamente al mismo tiempo, la base de datos (mediante Transacciones de Mongoose) debe otorgarlo al primero y rechazar al segundo con un error claro.

- **RF-4.3** - Límite de Ventana de Tiempo: El sistema no permitirá agendar turnos en el pasado, ni tampoco visualizar turnos con más de 30 días de anticipación (para evitar que la gente acapare turnos a futuro).

- **RF-4.4** - Límite de Abuso (Anti-Spam): Un mismo Paciente (DNI) no puede tener más de DOS (2) turnos en estado PENDIENTE para la misma Especialidad al mismo tiempo.

- **RF-4.5** - Cancelación por el Ciudadano: El paciente puede cancelar su propio turno desde el portal móvil, siempre y cuando falten al menos 2 horas para el inicio del mismo. Pasado ese tiempo, la acción de cancelar se deshabilita en su interfaz.

- **RF-4.6** - Gestión de Turnos en Recepción: La recepcionista debe poder visualizar todos los turnos del día en curso, ordenados cronológicamente, y tener botones rápidos para cambiar el estado de un turno a ATENDIDO o AUSENTE cuando el ciudadano llega a la salita.

## Módulo 5: Interfaz de Usuario (Portal Ciudadano - Mobile First)
- **RF-5.1** - Navegación Lineal (Wizard): El proceso para sacar un turno debe ser guiado paso a paso, impidiendo avanzar si no se completó el paso anterior:

Seleccionar Especialidad -> 2. Seleccionar Profesional (opcional) -> 3. Seleccionar Fecha -> 4. Seleccionar Horario libre -> 5. Confirmar.

- **RF-5.2** - Retroalimentación Visual Inmediata: Toda acción asíncrona (como buscar horarios) debe mostrar un indicador de carga (Skeleton o Spinner). El ciudadano nunca debe ver una pantalla estática y pensar que el sistema se colgó.

- **RF-5.3** - Panel "Mis Turnos": Al ingresar con su DNI, la primera pantalla que verá el ciudadano será un listado de sus próximos turnos (PENDIENTES) con el detalle de fecha, hora y consultorio, resaltando un botón para Cancelar.

## Módulo 6: Interfaz de Usuario (Panel Recepción/Admin - Desktop)
- **RF-6.1** - Dashboard Diario: La pantalla principal de los usuarios administrativos será el calendario del día actual.

- **RF-6.2** - Operación en Nombre de Terceros (Sobreturnos): La recepcionista debe poder otorgar un turno a un ciudadano presencialmente. Para esto, contará con un buscador rápido por DNI en el panel.

- **RF-6.3** - Tolerancia a Fallos de Red: Si un formulario administrativo (ej. carga de un nuevo médico) falla por validación del servidor o caída de red, los datos ya tipeados en los inputs no deben borrarse (estado persistente con React Hook Form) para que el operario pueda reintentar.