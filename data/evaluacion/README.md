# Casos de revisión adicionales

18 escenarios sintéticos nuevos redactados con asistencia de IA el 1 de noviembre
de 2026, tres por cada categoría. No proceden de usuarios ni equipos reales.
Las etiquetas y su justificación necesitan revisión humana del equipo.

No añadir estos casos al dataset de entrenamiento mientras se usen como evaluación.
Se evaluó el modelo ya guardado sin reentrenar y se verificó ausencia de duplicados
normalizados con el CSV original. Esta prueba pequeña no estima rendimiento real.

Repetir con `python -m src.models.analizar_errores`. El resultado y las huellas de los
archivos están en artifacts/analisis_errores.json; el notebook interpreta los errores.
Una vez inspeccionados los resultados, estos casos no deben reutilizarse como test
final independiente para seleccionar nuevas configuraciones.
