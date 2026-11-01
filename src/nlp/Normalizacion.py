"""Limpieza conservadora para descripciones de incidentes de red."""

import re
import unicodedata


def normalizar_texto(texto: str) -> str:
    """Conserva tildes y números; reemplaza URLs, puntuación y emojis.

    Las tildes ayudan al lematizador. Los números pueden identificar puertos,
    versiones o errores. Las URLs se reemplazan por un marcador estable.
    """
    if not isinstance(texto, str):
        raise TypeError("El texto debe ser una cadena de caracteres.")
    texto = unicodedata.normalize("NFC", texto).lower()
    texto = re.sub(r"(?:https?://|www\.)\S+", " enlaceweb ", texto)
    texto = "".join(caracter if caracter.isalnum() or caracter.isspace() else " "
                    for caracter in texto)
    return " ".join(texto.split())
