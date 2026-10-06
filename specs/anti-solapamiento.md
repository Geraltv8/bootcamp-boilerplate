# Spec: Funsion `verificarDisponibilidadTurno`

**Proposito:** Validar que un bloque de tiempo de 30 minutos esté libre para un medico especifico antes de guardar.

**Entradas (Parametros):**
- `medicoId`: string (ObjetId Valido).
- `fechaDeseada`: Date (ISO 8601)

**Logica de Negocio:** 
1. Calcular `fechaFin` sumando 30 minutos a `fechaDeseada`.
2. Consultar a Mongoose (modelo turno) si existe algun turno con estadao 'pendiente' o 'atendido' para ese `medicoId` que se solape con la franja [fechaDeseada - fechaFin]
3. Un solapamiento ocurre si: 
(turno.fecha < fechaFin) AND (turno.fechaFin > fechaDeseada).

**Salida:**
- Retorna `true` si esta disponible (no hay solapamiento).
- Retorna `false` si el bloque esta ocupado.