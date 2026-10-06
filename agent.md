# agent.md - Reglas de Arquitectura del Backend

## Stack Tecnologico
- Node.js, Express, TypeScript estricto.
- Mongoose para base de datos.

## Reglas inquebrantables de Codigo
1. PROHIBIDO el uso de `any`. Si no conoces el tipo, pregunta o usa `unknown`.
2. Las validaciones de datos entrantes (body, params, query) se hacen EXCLUSIVAMENTE con Zod 4.6.5 en adelante.
3. Todas las repuestas HTTP deben usar el formato: `respuestaEstandar(res, status, ok, message, data )`.
4. En consultas a Mongoose que modifiquen multiples colecciones, es OBLIGATORIO usar `session.startTransaction()`.
5. Nunca guardes contraseñas en texto plano, siempre usa `bcrypt`.
6. Al crear un nuevo modulo, manten la estructura que ya tienen el resto de los modulos.
7. No utilices funciones deprecadas de Zod.