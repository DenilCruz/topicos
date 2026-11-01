"""Stop words en español con conservación de negaciones relevantes."""

from spacy.lang.es.stop_words import STOP_WORDS

NEGACIONES = frozenset({"no", "ni", "nunca", "sin", "tampoco"})


def obtener_palabras_vacias(agregar=(), conservar=()) -> frozenset[str]:
    """Permite adaptar la lista al dominio sin perder negaciones por defecto."""
    return frozenset((set(STOP_WORDS) | set(agregar)) - NEGACIONES - set(conservar))


def eliminar_palabras_vacias(tokens: list[str], palabras_vacias) -> list[str]:
    return [token for token in tokens if token not in palabras_vacias]
