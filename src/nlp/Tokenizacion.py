"""Separación del texto normalizado en palabras y números."""


def tokenizar_texto(texto_normalizado: str) -> list[str]:
    """Separa por espacios; siglas como DNS o VLAN ya estarán en minúsculas."""
    return texto_normalizado.split()
