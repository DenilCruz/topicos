# Prueba de integración y guion de demostración

Fecha: 2 de noviembre de 2026. Código base: 772a70d con documentación y script de integración locales posteriores. Esta evidencia no implica que se haya publicado un commit nuevo.

## Resultado ejecutado

| Comprobación | Resultado |
| --- | --- |
| NLP y entrenamiento/serialización | 7 pruebas correctas |
| Backend: NLP, auditoría y cliente Groq | 24 pruebas correctas |
| Frontend: TypeScript y build Vite | Correcto, 167 módulos |
| Integración API con PostgreSQL de Supabase | 23 verificaciones correctas |
| Navegador, exportaciones y micrófono | Pendientes: la herramienta de navegador se detuvo al no poder identificar con seguridad la URL activa |
| Llamada real a Groq/DeepSeek | No ejecutada en esta prueba; el cliente Groq se prueba con respuestas simuladas |

Las pruebas unitarias del backend simulan dependencias en sus casos. La integración adicional sí carga el pipeline guardado, autentica mediante JWT, ejecuta middleware y consulta/escribe en la base configurada. Usa el cliente Django de pruebas dentro del proceso: no verifica transporte HTTP real, CORS ni el navegador.

## Comandos utilizados

Desde la raíz:

```powershell
python -m unittest discover -s tests -p "test_*.py"
python tests/prueba_integracion.py --puerto-bd 6543
```

Desde backend:

```powershell
python manage.py test modules.nlp modules.autenticacion.test_auditoria modules.reports.test_groq
```

Desde frontend:

```powershell
pnpm run build
```

La primera ejecución de unittest encontró permisos insuficientes del entorno restringido para archivos temporales. Se repitió con los permisos de ejecución necesarios y pasaron las siete pruebas. Los mensajes FileNotFoundError y error de auditoría emitidos en la suite backend corresponden a escenarios simulados de fallo y la suite terminó en OK.

Supabase rechazó inicialmente la conexión del puerto 5432 con EMAXCONNSESSION: sus 15 sesiones estaban ocupadas. La misma prueba pasó usando el puerto de transacciones 6543. La opción --puerto-bd solo afecta al proceso de prueba, no modifica el .env. Sin esa opción se usa la conexión habitual del backend. Si el servidor de desarrollo sigue usando 5432 y aparece ese error, la ejecución local aún puede fallar hasta liberar sesiones o configurar apropiadamente el pool.

## Recorrido verificado en la base real

El script crea una cuenta temporal de administrador con contraseña aleatoria que no se registra en la evidencia. Usa un dispositivo ya existente y ejecuta lo siguiente dentro de una transacción:

1. Rechaza el acceso a NLP sin autenticación y una contraseña incorrecta.
2. Obtiene JWT por el endpoint de login y consulta la identidad.
3. Comprueba pipeline disponible y métricas del modelo.
4. Rechaza texto vacío, más de 2000 caracteres y un campo de entrada incorrecto.
5. Clasifica una descripción de DHCP y obtiene el desglose real del preprocesamiento.
6. Consulta dispositivos y crea un ticket pendiente.
7. Diagnostica el ticket y comprueba directamente en PostgreSQL categoría, estado, probabilidad y tiempo.
8. Rechaza un segundo diagnóstico sobre el mismo ticket.
9. Consulta el ticket diagnosticado mediante filtros y verifica métricas de reportes.
10. Consulta opciones y rechaza una ventana de análisis inválida y una pregunta vacía.
11. Consulta logs como administrador y verifica el registro del diagnóstico.
12. Revierte la transacción y comprueba que se conserva la cantidad original de tickets.

La ejecución terminó el 2 de noviembre de 2026 a las 13:10:38 UTC con las 23 verificaciones correctas. El ticket temporal obtuvo la categoría FALLO_DHCP. Los números de secuencia de PostgreSQL pueden avanzar aunque las filas sean revertidas; un salto de ID no significa que se haya conservado un ticket de prueba. La prueba no elimina ni modifica tickets existentes.

## Guion de demostración en pantalla, de 5 a 7 minutos

Este apartado es un procedimiento para ejecutar y registrar. No acredita que ya se haya realizado en el navegador.

| Paso | Acción | Resultado que debe observarse |
| --- | --- | --- |
| 1 | Levantar backend y frontend siguiendo README | Servidores activos en 8000 y 3000 |
| 2 | Iniciar sesión con una cuenta autorizada | Pantalla de tickets y usuario identificado |
| 3 | Crear ticket: «El dispositivo no obtiene una dirección IP del servidor DHCP y no puede conectarse a la red.» | Ticket con dispositivo y estado pendiente |
| 4 | En NLP, analizar esa misma descripción | Categoría, probabilidad y seis etapas de procesamiento |
| 5 | Desplegar comparación de modelos | Métricas guardadas y matrices legibles |
| 6 | Mostrar evaluación adicional | Se explica que 100 % y 55.6 % proceden de muestras distintas |
| 7 | Diagnosticar el ticket mediante la API autenticada | Estado DIAGNOSTICADO y campos guardados al volver a consultar |
| 8 | Abrir reportes estáticos y dashboard | El ticket se refleja en los datos del backend |
| 9 | Filtrar y exportar CSV/PDF | Archivos descargados con filas que coinciden con el filtro |
| 10 | En análisis IA escribir «¿Cuántos tickets tienen diagnóstico y cuáles son las categorías principales?» | Respuesta basada en métricas si el proveedor está disponible |
| 11 | Repetir la pregunta por micrófono, si el navegador lo admite | Transcripción, respuesta y reproducción de voz |
| 12 | Abrir Logs como administrador | Operaciones recientes, filtros y detalle |

La pantalla de tickets aún no ofrece un botón para invocar el diagnóstico. Para el paso 7 puede usarse un cliente REST con el JWT de la cuenta iniciada, sin mostrarlo en capturas:

```http
POST /api/v1/nlp/diagnosticar/
Authorization: Bearer <token de la sesión>
Content-Type: application/json

{"ticket_id": <id del ticket creado>}
```

No repetir esa llamada sobre un ticket ya diagnosticado esperando un nuevo resultado: la API lo rechaza deliberadamente. La prueba visual de los pasos 3 y 7 crea un ticket real de demostración, a diferencia del script reversible.

## Evidencia manual que debe adjuntarse al ejecutarla

Al realizar la demostración, incorporar aquí las observaciones sobre ticket pendiente, resultado NLP, preprocesamiento, comparación, ticket diagnosticado, reportes y logs. Registrar navegador y versión, resultado observado y errores. Para voz, anotar permiso del micrófono y proveedor; ocultar contraseñas, tokens, claves y datos personales. Si un paso falla, registrar el fallo y repetirlo después de corregirlo, sin marcarlo como aprobado por anticipado.

## Alcance y cierre

Actualización de instalación del 2 de noviembre: se añadió `preparar_base`, que crea las tablas de negocio faltantes desde los modelos, y se fijaron las dependencias en `requirements-lock.txt`. La prueba `modules.tickets.test_instalacion`, ejecutada con `config.settings.pruebas_instalacion`, verifica una base SQLite vacía, idempotencia, rechazo de tablas incompatibles, login, creación de tickets, reportes y logs. Pasaron los 25 tests del backend al incluir esta prueba. La instalación del frontend con pnpm 10.34.7, `--frozen-lockfile --offline --ignore-scripts`, confirmó que el lockfile está actualizado. Las instrucciones vigentes están en README.md. No se ejecutó este aprovisionamiento sobre Supabase compartido ni sobre un PostgreSQL nuevo; Docker no estaba en ejecución en el equipo.

La integración del backend y la persistencia del diagnóstico están verificadas en esta ejecución. Quedan por comprobar la interacción completa del navegador, las exportaciones y la voz. También queda pendiente probar una instalación desde cero con un esquema de base aprovisionado. Estas tareas se distinguen de la revisión técnica humana del dataset y de la evaluación individual exigida por el docente.
