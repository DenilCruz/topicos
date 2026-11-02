# Contribuciones del equipo

Registro elaborado el 2 de noviembre de 2026 a partir del historial publicado en `origin/main` de [DenilCruz/topicos](https://github.com/DenilCruz/topicos). Referencia revisada: `772a70d`.

La autoría de esta tabla es la registrada en Git. Describe cambios observables, no horas trabajadas ni una verificación de comprensión individual. Los nombres se conservan como aparecen en los commits. No se atribuyen tareas adicionales sin evidencia.

## Denilson Cruz

| Commit | Mensaje original | Aporte observable |
| --- | --- | --- |
| [1297ec5](https://github.com/DenilCruz/topicos/commit/1297ec5) | incio | Estructura inicial Django/React y módulos base de autenticación, Bonita, NLP por reglas y logs. |
| [85ad7b9](https://github.com/DenilCruz/topicos/commit/85ad7b9) | basededatos | Configuración PostgreSQL/Supabase, variables de entorno y dependencias de conexión. |
| [7c9d81c](https://github.com/DenilCruz/topicos/commit/7c9d81c) | nlp-cruz | Dataset traducido, etapas NLP, regresión logística y Naive Bayes, entrenamiento/evaluación, pipeline y métricas, API de diagnóstico, pantalla NLP y pruebas. |
| [d529683](https://github.com/DenilCruz/topicos/commit/d529683) | interfaz y algunas cositas | Notebook ejecutado, casos y análisis adicional de errores, endpoints de métricas/estado, panel comparativo y pruebas. |
| [f0c0689](https://github.com/DenilCruz/topicos/commit/f0c0689) | mejorando interfaz | Componentes y estilos de Tickets, NLP, Logs y Reportes; acordeones y estados animados; proveedor Groq alternativo; tablas Markdown y consulta escrita; adaptación de auditoría al esquema existente; retirada de Bonita del menú. |

Integraciones registradas: [eabb6e0](https://github.com/DenilCruz/topicos/commit/eabb6e0), [b4f7682](https://github.com/DenilCruz/topicos/commit/b4f7682) y [772a70d](https://github.com/DenilCruz/topicos/commit/772a70d), con mensaje `Merge Cruz into main`. Estos commits documentan integración, no aportes funcionales independientes de los anteriores.

## Jorge Rosales

| Commit | Mensaje original | Aporte observable |
| --- | --- | --- |
| [5802c7a](https://github.com/DenilCruz/topicos/commit/5802c7a) | feat(auth): implementacion modulo autenticacion UC-BE-08 con JWT y roles RBAC | Login, registro, consulta de usuario, tokens JWT, roles, migraciones y pruebas de autenticación. |
| [f447fb4](https://github.com/DenilCruz/topicos/commit/f447fb4) | implementacion modulo 04 autenticacion y auditoria UC-BE-08 y UC-BE-09 | Decorador de auditoría de operaciones, modelo de auditoría y migración inicial, con pruebas asociadas. La adaptación posterior a las columnas de Supabase está en `f0c0689`, de Denilson Cruz. |

## OscarArancibia

| Commit | Mensaje original | Aporte observable |
| --- | --- | --- |
| [edd07ef](https://github.com/DenilCruz/topicos/commit/edd07ef) | Se agrego el modulo de ticket y reportes | Modelos y API de tickets/dispositivos, filtros y paginación; reportes de métricas, resumen DeepSeek y consulta por voz; frontend de tickets/reportes, gráficos y exportaciones; ampliaciones de Bonita y migraciones relacionadas. |
| [ad485ad](https://github.com/DenilCruz/topicos/commit/ad485ad) | union de las ramas | Integración de las ramas de autenticación y tickets/reportes en main. |

## Trazabilidad y revisión

- Los cambios posteriores no sustituyen la autoría de las implementaciones originales: por ejemplo, el módulo de reportes se incorporó con OscarArancibia y después se amplió y rediseñó con Denilson Cruz.
- No se dispone en esta revisión de evidencia de PR aprobados por otro integrante. Los merges del historial por sí solos no prueban ese requisito. Completar con enlaces a PR y revisiones reales si existen.
- En el historial revisado no se identifica todavía un aporte significativo a `src/nlp/` o `src/models/` de Jorge Rosales u OscarArancibia. Cada integrante debe cumplir ese requisito con trabajo real; no cambiar autores ni inventar contribuciones.
- Este archivo y la actualización del README todavía no tienen un commit publicado al momento de su redacción. Agregar su referencia cuando se integren.

## Asistencia de IA y defensa

Se utilizó asistencia de IA en implementación, preparación/traducción de datos, generación de casos sintéticos y documentación. El equipo debe revisar el resultado y declarar este uso en el informe técnico.

Cada integrante debe poder explicar las decisiones y modificar el código atribuido a su cuenta. Los commits reflejan autoría registrada; no certifican revisión técnica ni dominio del contenido. El trabajo en pareja debe registrarse con `Co-authored-by:` cuando corresponda, sin reescribir ni falsear el historial existente.
