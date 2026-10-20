# Bootcamp Boilerplate — API de turnos médicos

API REST construida con Node.js, Express, TypeScript, Mongoose y MongoDB. Permite autenticar ciudadanos y personal, administrar médicos y agendas, consultar disponibilidad y gestionar turnos.

> Esta documentación describe el estado de las rutas en el código. El repositorio implementa el backend; las interfaces web/mobile de los requisitos funcionales no están incluidas.

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Iniciar y compilar](#iniciar-y-compilar)
- [Probar desde PowerShell](#probar-desde-powershell)
- [Convenciones de la API](#convenciones-de-la-api)
- [Flujo sugerido para probar turnos](#flujo-sugerido-para-probar-turnos)
- [Endpoints](#endpoints)
  - [Autenticación](#autenticación)
  - [Especialidades](#especialidades)
  - [Médicos](#médicos)
  - [Agendas](#agendas)
  - [Disponibilidad y turnos](#disponibilidad-y-turnos)
  - [Pacientes](#pacientes)
  - [Recepción](#recepción)
  - [Consultorios](#consultorios)
  - [Análisis IA](#análisis-ia)
- [Estados y reglas importantes](#estados-y-reglas-importantes)
- [Problemas frecuentes](#problemas-frecuentes)

## Requisitos

- Node.js y npm compatibles con las versiones instaladas en el proyecto.
- MongoDB Atlas o una instancia MongoDB local accesible mediante URI.
- MongoDB configurado como **replica set** para ejecutar las reservas, que usan transacciones.
- Una API key de Google Gemini para cargar el módulo de IA.

Variables necesarias:

| Variable | Uso |
|---|---|
| `DATABASE_URL_ATLAS` | URI de conexión a MongoDB. |
| `JWT_SECRET` | Secreto para firmar y verificar JWT. Usá un secreto largo y privado. |
| `GEMINI_API_KEY` | API key utilizada por el endpoint de análisis IA. |
| `PORT` | Puerto HTTP. Opcional; por defecto `3000`. |
| `ENTORNO` | Texto informativo de entorno mostrado en el log de arranque. Opcional. |

No guardes secretos en el repositorio ni compartas el archivo `.env`.

## Configuración local

Desde PowerShell, en la raíz del proyecto:

```powershell
npm install
Copy-Item .env.example .env
```

Si no existe `.env.example`, crea `.env` con este contenido y completa los valores:

```dotenv
DATABASE_URL_ATLAS=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>?retryWrites=true&w=majority
JWT_SECRET=<secreto-largo-aleatorio>
GEMINI_API_KEY=<api-key-de-gemini>
PORT=3000
ENTORNO=Local
```

Reemplazá los marcadores por los datos reales. La URI de MongoDB debe incluir una base de datos y permitir transacciones (replica set). El catálogo inicial de especialidades se inserta al iniciar el servidor; el proceso de arranque espera a que la conexión y esa inicialización terminen.

El modelo carga especialidades iniciales: `cardiologia`, `pediatria`, `dermatologia`, `neurologia`, `clinica`, `ginecologia` y `traumatologia`.

## Iniciar y compilar

Desarrollo con reinicio automático:

```powershell
npm run dev
```

Compilar TypeScript:

```powershell
npm run build
```

Ejecutar el JavaScript compilado:

```powershell
npm start
```

La API queda disponible en `http://localhost:3000` salvo que se configure otro `PORT`. Actualmente no hay un endpoint de health check.

## Probar desde PowerShell

Los ejemplos de esta guía usan `Invoke-RestMethod`, disponible en Windows PowerShell y PowerShell 7. Esta función pequeña permite enviar JSON y, si se indica, un JWT:

```powershell
$BaseUrl = 'http://localhost:3000/api/v1'

function Invoke-Api {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Path,
        [object]$Body,
        [string]$Token
    )

    $headers = @{}
    if ($Token) {
        $headers.Authorization = "Bearer $Token"
    }

    $parameters = @{
        Method      = $Method
        Uri         = "$BaseUrl$Path"
        Headers     = $headers
        ContentType = 'application/json'
    }
    if ($null -ne $Body) {
        $parameters.Body = ConvertTo-Json -InputObject $Body -Depth 10
    }
    Invoke-RestMethod @parameters
}
```

Ejemplo:

```powershell
$respuesta = Invoke-Api -Method POST -Path '/auth/ciudadano-login' -Body @{
    dni      = '30123456'
    telefono = '1123456789'
}
$respuesta
$tokenPaciente = $respuesta.data.token
```

Para observar un error HTTP (por ejemplo un `401`), `Invoke-RestMethod` lanza una excepción. El status y cuerpo se pueden inspeccionar con `catch`:

```powershell
try {
    Invoke-Api -Method GET -Path '/turnos/me'
} catch {
    $_.Exception.Response.StatusCode
    $_.ErrorDetails.Message
}
```

## Convenciones de la API

- Prefijo: `/api/v1`.
- JSON: enviar `Content-Type: application/json` en solicitudes con body.
- JWT: enviar `Authorization: Bearer <token>`.
- Respuesta habitual:

  ```json
  {
    "ok": true,
    "message": "Operación completada",
    "data": {}
  }
  ```

- Los errores funcionales suelen mantener el mismo formato y devolver `data` con detalles si corresponde. La respuesta de rutas inexistentes es una excepción y usa `{ success, timestamp, error, message }`.
- Los IDs de recursos MongoDB son ObjectId hexadecimales de 24 caracteres.
- Las fechas de turnos se envían como ISO 8601 **con offset**, por ejemplo `2030-03-14T10:30:00-03:00`. Los filtros `fecha` usan `YYYY-MM-DD`; el backend calcula el rango del día en UTC.
- Las horas de agenda son `HH:mm` interpretadas en UTC por el motor de disponibilidad. `diaSemana` usa `Date.getUTCDay()`: `0` domingo, `1` lunes, ..., `6` sábado.
- La API tiene roles `ADMIN`, `RECEPCIONISTA`, `PACIENTE` y `MEDICO`. `PACIENTE` es el rol ciudadano.

### Variables que se usan en los ejemplos

Completa estos valores conforme pruebes:

```powershell
$tokenAdmin = '<JWT_ADMIN>'
$tokenRecepcionista = '<JWT_RECEPCIONISTA>'
$tokenPaciente = '<JWT_PACIENTE>'
$medicoId = '<OBJECT_ID_MEDICO>'
$especialidadId = '<OBJECT_ID_ESPECIALIDAD>'
$agendaId = '<OBJECT_ID_AGENDA>'
$turnoId = '<OBJECT_ID_TURNO>'
$consultorioId = '<OBJECT_ID_CONSULTORIO>'
```

## Flujo sugerido para probar turnos

1. Iniciar el servidor con MongoDB, JWT y Gemini configurados.
2. Obtener un JWT ADMIN. El endpoint de registro **requiere un ADMIN existente**; no es una ruta de bootstrap. Crea la primera cuenta admin mediante un proceso de aprovisionamiento seguro autorizado para el entorno.
3. Crear una cuenta de médico con `POST /auth/register` (`rol: MEDICO`), luego crear el perfil médico con `POST /medicos`.
4. Crear una agenda semanal con `POST /medicos/:medicoId/agendas`.
5. Iniciar sesión como paciente con `POST /auth/ciudadano-login`. Si el DNI no existe, esta operación crea un paciente mínimo automáticamente.
6. Preparar una fecha dentro de los próximos 30 días y consultar `GET /turnos/disponibilidad`:

   ```powershell
   $fechaPrueba = (Get-Date).ToUniversalTime().Date.AddDays(3).ToString('yyyy-MM-dd')
   $diaSemana = [int][DateTime]::ParseExact(
       $fechaPrueba,
       'yyyy-MM-dd',
       [Globalization.CultureInfo]::InvariantCulture
   ).DayOfWeek

   $agenda = Invoke-Api -Method POST -Path "/medicos/$medicoId/agendas" -Token $tokenAdmin -Body @{
       diaSemana       = $diaSemana
       horaInicio      = '09:00'
       horaFin         = '12:00'
       duracionMinutos = 30
   }

   $disponibilidad = Invoke-Api -Method GET `
       -Path "/turnos/disponibilidad?especialidadId=$especialidadId&fecha=$fechaPrueba"
   $disponibilidad.data
   ```

   Para usar `POST /turnos`, los slots que devuelve el backend están expresados en UTC: enviar exactamente el `fechaHoraInicio` devuelto, junto con la especialidad y médico elegidos:

   ```powershell
   $horario = $disponibilidad.data | Select-Object -First 1
   $fechaHoraInicio = ([DateTime]$horario.fechaHoraInicio).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

   $reserva = Invoke-Api -Method POST -Path '/turnos' -Token $tokenPaciente -Body @{
       especialidadId  = $especialidadId
       medicoId        = $horario.medicoId
       fechaHoraInicio = $fechaHoraInicio
   }
   $reserva
   $turnoId = $reserva.data._id
   ```

8. Consultar `GET /turnos/me`. Para probar recepción, iniciar sesión como recepcionista, buscar al paciente por DNI y usar `POST /recepcion/turnos`.

## Endpoints

### Autenticación

#### `POST /auth/login` — iniciar sesión de personal

- **Acceso:** público.
- **Body:**

  ```json
  {
    "email": "recepcion@example.com",
    "password": "una-clave-segura"
  }
  ```

- **Éxito:** `200`; `data.token` contiene el JWT.
- **Errores:** `400` por body inválido; `401` por credenciales incorrectas o cuenta inactiva.
- Las contraseñas de personal se comparan contra su hash bcrypt.

#### `POST /auth/ciudadano-login` — iniciar sesión o registrar ciudadano

- **Acceso:** público.
- **Body:**

  ```json
  {
    "dni": "30123456",
    "telefono": "1123456789"
  }
  ```

- El DNI debe tener 7 u 8 dígitos; el teléfono admite de 7 a 15 dígitos después de normalizar los separadores.
- Si el DNI no existe, se crea un paciente mínimo. Si existe y el teléfono no coincide con el registrado, responde `401`.
- **Éxito:** `200`, `data` contiene `token` y un perfil mínimo (`id`, `dni`, `nombre`).
- **Conflicto:** `409` si una carrera de altas termina en DNI duplicado.

#### `POST /auth/register` — crear cuenta de personal

- **Acceso:** `ADMIN`.
- **Body:**

  ```json
  {
    "email": "medico@example.com",
    "user": "medico1",
    "password": "clave-de-al-menos-8-caracteres",
    "rol": "MEDICO"
  }
  ```

- `user` es opcional. `rol` puede ser `ADMIN`, `RECEPCIONISTA` o `MEDICO`.
- **Éxito:** `201`; `data` incluye identificador, email, user y rol, nunca la contraseña.
- **Errores:** `400` por duplicidad/validación, `401` sin token válido, `403` si no es ADMIN.

### Especialidades

Todas las rutas de este recurso actualmente requieren JWT. La lista admite `PACIENTE`, `RECEPCIONISTA` y `ADMIN`; detalle y mutaciones requieren `ADMIN`.

#### `GET /especialidades`

- **Query opcional:** `incluirInactivas=true|false`. Solo ADMIN puede ver inactivas.
- **Respuesta:** `200`, lista ordenada por nombre. Los registros incluyen `id`, `codigo`, `nombre`, `descripcion` y `activo`.

#### `GET /especialidades/:id`

- **Acceso:** `ADMIN`.
- **Respuesta:** `200` con el registro; `404` si no existe; `400` si el ID es inválido.

#### `POST /especialidades`

- **Acceso:** `ADMIN`.
- **Body:**

  ```json
  {
    "nombre": "Oftalmología",
    "descripcion": "Atención de salud visual"
  }
  ```

- `descripcion` es opcional. El servidor normaliza y crea `codigo` a partir del nombre.
- **Éxito:** `201`; duplicidad de nombre/código: `409`.

#### `PATCH /especialidades/:id`

- **Acceso:** `ADMIN`.
- **Body parcial:**

  ```json
  {
    "descripcion": "Descripción actualizada"
  }
  ```

- Campos admitidos: `nombre`, `descripcion`, `activo`. Debe incluir al menos uno.
- **Éxito:** `200`; recurso inexistente: `404`; conflictos de nombre o baja con dependencias: `409`.

#### `DELETE /especialidades/:id`

- **Acceso:** `ADMIN`.
- Da de baja lógicamente la especialidad; no la elimina físicamente.
- Rechaza con `409` si tiene médicos activos asociados o turnos pendientes futuros.
- **Éxito:** `200`.

### Médicos

Todas las rutas requieren JWT. Lectura: `ADMIN`, `RECEPCIONISTA`, `MEDICO` o `PACIENTE`; creación y baja: `ADMIN`; actualización: `ADMIN` o `MEDICO` (el médico solo puede cambiar su propio teléfono).

#### `GET /medicos`

- **Query:** `especialidad` (código), `activo=true|false`, `busqueda` (nombre/apellido parcial).
- Por defecto solo devuelve médicos activos. `PACIENTE` siempre ve activos.
- **Respuesta:** `200`, lista de médicos; cuenta vinculada se popula con email.

Ejemplo:

```powershell
Invoke-Api -Method GET -Path "/medicos?especialidad=pediatria&busqueda=ana" -Token $tokenPaciente
```

#### `GET /medicos/:id`

- **Respuesta:** `200` con médico; `404` si no existe.

#### `POST /medicos`

- **Acceso:** `ADMIN`.
- **Body:**

  ```json
  {
    "usuarioId": "65f000000000000000000001",
    "nombre": "Ana",
    "apellido": "Pérez",
    "matricula": "MP12345",
    "especialidades": ["pediatria"],
    "telefono": "1123456789"
  }
  ```

- `usuarioId` debe pertenecer a una cuenta con rol `MEDICO`. Crear esa cuenta primero con `/auth/register`.
- Matrícula alfanumérica única; cada especialidad debe ser un código existente y activo.
- **Éxito:** `201`; cuenta/matrícula duplicada `409`; datos inválidos `400`.

#### `PATCH /medicos/:id`

- **Acceso:** `ADMIN` o `MEDICO`.
- ADMIN puede enviar cualquier subconjunto de campos de creación.
- MEDICO solo puede enviar `telefono`, y solo para su propio perfil.
- **Éxito:** `200`; `403` por campos/perfil no autorizados; `404` si no existe.

#### `DELETE /medicos/:id`

- **Acceso:** `ADMIN`.
- Da de baja lógicamente el médico. La operación rechaza `400` si hay turnos pendientes futuros.
- **Éxito:** `200`.

### Agendas

Todas las rutas requieren JWT. Lectura de agenda: `ADMIN`/`RECEPCIONISTA`; mutaciones solo `ADMIN`.

#### `GET /medicos/:medicoId/agendas`

- **Query:** `incluirInactivas=true|false`; solo ADMIN puede solicitar las inactivas.
- **Respuesta:** `200`, agendas ordenadas por día y hora.

#### `POST /medicos/:medicoId/agendas`

- **Acceso:** `ADMIN`.
- **Body:**

  ```json
  {
    "diaSemana": 1,
    "horaInicio": "09:00",
    "horaFin": "13:00",
    "duracionMinutos": 30
  }
  ```

- `diaSemana`: `0` domingo, `1` lunes, ..., `6` sábado (UTC).
- Las horas del bloque (`horaInicio`, `horaFin`) se interpretan en UTC en el servicio de disponibilidad.
- Inicio debe ser anterior a fin; duración positiva y no mayor al bloque. No se permiten agendas solapadas del mismo médico en el mismo día.
- **Éxito:** `201`; solapamiento `409`; médico inexistente/inactivo `404`; bloque inválido `400`.

#### `PATCH /agendas/:id`

- **Acceso:** `ADMIN`.
- **Body parcial:** uno o más campos `diaSemana`, `horaInicio`, `horaFin`, `duracionMinutos`, `activo`.
- Valida el bloque y el solapamiento con otras agendas, excluyendo la agenda actual.
- **Éxito:** `200`; solapamiento `409`; ID inexistente `404`.

#### `DELETE /agendas/:id`

- **Acceso:** `ADMIN`.
- Baja lógica (`activo=false`); conserva historial.
- **Éxito:** `200`; no encontrada `404`.

### Disponibilidad y turnos

#### `GET /turnos/disponibilidad`

- **Acceso:** público.
- **Query requerida:** `especialidadId` (ObjectId), `fecha` (`YYYY-MM-DD`).
- **Query opcional:** `medicoId` (ObjectId).

```powershell
$fechaPrueba = (Get-Date).ToUniversalTime().Date.AddDays(3).ToString('yyyy-MM-dd')
Invoke-Api -Method GET -Path "/turnos/disponibilidad?especialidadId=$especialidadId&fecha=$fechaPrueba"
```

- Solo considera especialidad, médicos y agendas activos. Devuelve bloques libres por médico y los ordena por hora.
- **Respuesta:** `200`, `data` es una lista de objetos con `medicoId`, `nombreMedico`, `fechaHoraInicio`, `duracionMinutos`.
- Devuelve lista vacía si no hay horarios disponibles.
- Fecha pasada o posterior a 30 días, especialidad inválida/inactiva o médico no compatible: `400`.

#### `POST /turnos`

- **Acceso:** `PACIENTE`. El paciente se identifica mediante JWT, no en el body.
- **Body:**

  ```json
  {
    "especialidadId": "65f000000000000000000010",
    "medicoId": "65f000000000000000000020",
    "fechaHoraInicio": "2026-10-23T09:30:00.000Z"
  }
  ```

- `medicoId` es opcional; si no se envía, el sistema selecciona un profesional que tenga disponible ese instante.
- La fecha del ejemplo es ilustrativa: debe estar dentro de los próximos 30 días. En la práctica, copiar exactamente el `fechaHoraInicio` UTC devuelto por disponibilidad. El turno nace como `pendiente`; el cliente no puede elegir estado, paciente ni consultorio.
- Se ejecuta con transacción. Un límite de dos turnos pendientes por especialidad y las reservas concurrentes se rechazan con `409`.
- **Éxito:** `201`, turno creado. `400` por validación; `401` sin token; `403` por rol incorrecto; `409` por indisponibilidad/límite; `500` por error interno.

#### `GET /turnos`

- **Acceso:** `PACIENTE`, `RECEPCIONISTA`, `ADMIN`.
- **Query opcional:** `fecha=YYYY-MM-DD`, `estado=pendiente|atendido|cancelado|ausente`, `medicoId`, `pacienteId`.
- `PACIENTE` siempre queda limitado a sus propios turnos; no se usa `pacienteId` del query para seleccionar identidad.
- Recepción/Admin sin `fecha` reciben los turnos del día UTC actual. El resultado está ordenado cronológicamente e incluye datos resumidos de paciente, médico y consultorio asignado.

#### `GET /turnos/me`

- **Acceso:** `PACIENTE`.
- Devuelve próximos turnos pendientes del paciente autenticado, ordenados por fecha. Puede incluir `consultorioId` si se asignó uno.
- **Respuesta:** `200`, lista de turnos.

#### `GET /turnos/:id`

- **Acceso:** `PACIENTE`, `RECEPCIONISTA`, `ADMIN`.
- Paciente solo puede obtener sus turnos; si no existe o pertenece a otra persona, responde `404`.
- **Respuesta:** `200` turno; `400` ID mal formado; `404` no encontrado.

#### `PATCH /turnos/:id/cancelacion`

- **Acceso:** `PACIENTE`, `RECEPCIONISTA`, `ADMIN`.
- No requiere body.
- El paciente solo puede cancelar su turno pendiente si faltan al menos dos horas. Recepción/Admin pueden cancelar turnos pendientes sin esa condición temporal.
- Cambia el estado a `cancelado` y marca el turno inactivo, conservando el documento.
- **Éxito:** `200`; si no existe, no está pendiente o el paciente no cumple la ventana, `409`.

#### `PATCH /turnos/:id/estado` (y alias `PATCH /turnos/:id`)

- **Acceso:** `ADMIN`, `RECEPCIONISTA`.
- **Body:**

  ```json
  {
    "estado": "atendido"
  }
  ```

- Valores permitidos: `atendido` o `ausente`. Solo se puede cambiar desde `pendiente`.
- **Éxito:** `200`; turno no pendiente/inexistente `409`.

#### `DELETE /turnos/:id`

- **Acceso:** `ADMIN`.
- Compatibilidad con ruta de baja lógica: cambia estado a `cancelado` y `activo=false`; conserva el historial.
- **Éxito:** `200`; no encontrado/no pendiente `404`.

### Pacientes

#### `GET /pacientes/me`

- **Acceso:** `PACIENTE`.
- Obtiene el paciente asociado al JWT; no acepta ID/DNI en la ruta.
- **Respuesta:** `200`; paciente inexistente/inactivo `404`.

#### `GET /pacientes`

- **Acceso:** `ADMIN`, `RECEPCIONISTA`.
- **Query:** `dni` (formato 7 u 8 dígitos), `obraSocial`.
- Recepción debe enviar DNI y recibe solo campos básicos de identificación; ADMIN puede listar y usar filtros.
- **Respuesta:** `200`, lista de pacientes activos.

```powershell
Invoke-Api -Method GET -Path '/pacientes?dni=30123456' -Token $tokenRecepcionista
```

#### `POST /pacientes`

- **Acceso:** `ADMIN`, `RECEPCIONISTA`.
- **Body:**

  ```json
  {
    "nombre": "Juan",
    "dni": "30123456",
    "direccion": {
      "calle": "San Martín",
      "numero": "123",
      "piso": "",
      "departamento": "",
      "barrio": "Centro"
    },
    "email": "juan@example.com",
    "telefono": {
      "tipo": "CELULAR",
      "codigoArea": "11",
      "numero": "23456789"
    },
    "obraSocial": {
      "nombre": "NINGUNA",
      "numeroAfiliado": ""
    },
    "historialMedico": {
      "fecha": "2030-03-14",
      "diagnostico": "Control",
      "tratamiento": "Seguimiento",
      "medico": "Dra. Pérez"
    }
  }
  ```

- `direccion` requiere calle y número (pueden omitirse para usar defaults). `obraSocial.nombre` debe ser un valor del enum documentado abajo. `telefono.tipo`: `CELULAR`, `FIJO` o `TRABAJO`.
- **Éxito:** `201`; DNI/email duplicado `409`; body inválido `400`.
- El login ciudadano automático crea un perfil mínimo sin estos datos clínicos.

#### `DELETE /pacientes/:id`

- **Acceso:** `ADMIN`.
- Baja lógica; no elimina físicamente el paciente.
- **Éxito:** `200`; no encontrado `404`.

### Recepción

#### `GET /recepcion/pacientes?dni=<DNI>`

- **Acceso:** `ADMIN`, `RECEPCIONISTA`.
- Búsqueda exacta de paciente activo. DNI de 7 u 8 dígitos.
- **Respuesta:** `200` con identificación básica; `404` si no existe.

#### `POST /recepcion/turnos`

- **Acceso:** `ADMIN`, `RECEPCIONISTA`.
- **Body:**

  ```json
  {
    "dni": "30123456",
    "especialidadId": "65f000000000000000000010",
    "medicoId": "65f000000000000000000020",
    "consultorioId": "65f000000000000000000030",
    "fechaHoraInicio": "2026-10-23T09:30:00.000Z"
  }
  ```

- `medicoId` y `consultorioId` son opcionales. El paciente debe existir previamente; esta ruta no crea perfiles de pacientes.
- La fecha del ejemplo es ilustrativa: debe estar dentro de los próximos 30 días y coincidir exactamente con un horario devuelto por disponibilidad. Aplica la ventana de tiempo y el límite de turnos pendientes. El operador queda registrado en `creadoPor`.
- **Éxito:** `201`; paciente no encontrado `404`; conflicto de reserva `409`.

### Consultorios

Las lecturas requieren JWT de `PACIENTE`, `RECEPCIONISTA` o `ADMIN`. Crear, actualizar y dar de baja requiere `ADMIN`.

#### `GET /consultorio`

- **Query:** `especialidad` (código), `activo=true|false`. Por defecto solo activos; solo ADMIN puede consultar inactivos.
- **Respuesta:** `200`, lista de consultorios.

#### `POST /consultorio`

- **Body:**

  ```json
  {
    "nombre": "Consultorio 4",
    "especialidad": "pediatria",
    "piso": 1,
    "capacidad": 1,
    "observaciones": ""
  }
  ```

- `especialidad` debe ser un código activo. El nombre es único.
- **Éxito:** `201`; duplicado `409`; especialidad inexistente/inactiva `400`.

#### `PATCH /consultorio/:id`

- **Body parcial:** `nombre`, `especialidad`, `piso`, `capacidad`, `observaciones`, `activo`.
- **Éxito:** `200`; consultorio inexistente `404`; datos inválidos `400`.

#### `DELETE /consultorio/:id`

- Baja lógica.
- **Éxito:** `200`; no encontrado `404`.

> La asignación del consultorio al turno es opcional. No se asigna automáticamente.

### Análisis IA

#### `POST /ia/analizar`

- **Acceso:** actualmente la ruta no exige JWT.
- **Body actual:**

  ```json
  {
    "notasDelMedico": "Paciente refiere dolor de cabeza desde ayer..."
  }
  ```

- **Respuesta esperada:** `200`, `data` con `resumenCorto`, `gravedad` (`ALTA`, `MEDIA`, `BAJA`) y `medicamentosMencionados` (array).
- Requiere `GEMINI_API_KEY`. La ruta actual no tiene middleware de validación Zod para el body; enviar una cadena en `notasDelMedico`.
- **Error de procesamiento:** `500`.

## Estados y reglas importantes

Valores persistidos de `estado`:

| Estado | Significado |
|---|---|
| `pendiente` | Reserva activa esperando atención. Estado inicial. |
| `atendido` | Atención completada. |
| `cancelado` | Turno cancelado. La cancelación también pone `activo=false`. |
| `ausente` | El paciente no se presentó. |

Reglas de reserva:

- La fecha no puede estar en el pasado ni superar 30 días.
- Un paciente no puede acumular más de dos turnos pendientes de la misma especialidad.
- La duración procede de la agenda del médico.
- Las transacciones MongoDB necesitan replica set.
- El consultorio queda sin asignar salvo que recepción indique uno al crear el turno presencial.

Especialidades admitidas como obra social (`obraSocial.nombre`): `PAMI`, `OSPEL`, `OSDE`, `SANCOR`, `OSECAC`, `SWISS MEDICAL`, `GALENO`, `MEDICUS`, `OMINT`, `FEMEBA`, `OTRAS`, `NINGUNA`.

## Problemas frecuentes

| Síntoma | Causa probable / solución |
|---|---|
| El proceso termina antes de escuchar en el puerto | Verificar `DATABASE_URL_ATLAS`, acceso de red a MongoDB y permisos del usuario DB. |
| Error de transacción o `Transaction numbers are only allowed...` | La instancia MongoDB no está configurada como replica set. |
| Error `Falta configurar la variable ... GEMINI_API_KEY` | Definir `GEMINI_API_KEY` antes de arrancar; el servicio IA se inicializa al cargar la aplicación. |
| `401` | Falta JWT, token inválido/expirado o credenciales incorrectas. |
| `403` | El JWT es válido, pero el rol no tiene permiso para esa ruta. |
| `400` con “datos inválidos” | Revisar tipos, formato de fecha/ID, campos obligatorios y enumeraciones. |
| `409` al reservar | El horario fue tomado, ya no está disponible o se alcanzó el máximo de turnos pendientes para la especialidad. |
| No aparece una especialidad en el catálogo | El catálogo se inicializa al arrancar. Revisar logs/conexión; las bajas lógicas no se reactivan automáticamente. |
| ESLint no inicia con `@eslint/js` no encontrado | La configuración de lint requiere ese paquete, pero actualmente no hay script de lint declarado en `package.json`. |

## Pruebas

El script `npm test` todavía es un placeholder que termina con “Error: no test specified”; no existe una suite automatizada configurada actualmente. `npm run build` comprueba los tipos de TypeScript:

```powershell
npm run build
```
