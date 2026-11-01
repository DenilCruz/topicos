# Pruebas

Reservado para pruebas del pipeline de NLP, entrenamiento e integración con la API. Agregar pruebas de comportamiento al implementar esas funcionalidades.

Las pruebas de aplicaciones Django pueden permanecer junto a sus módulos. Las existentes de autenticación se ejecutan desde `backend/` con:

```bash
python manage.py test modules.autenticacion
```

Esta carpeta no contiene todavía pruebas automatizadas.
