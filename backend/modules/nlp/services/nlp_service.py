from typing import Dict, Any, List, Optional
from core.exceptions import DomainException
from modules.nlp.domain.protocols import INlpEngine
from modules.nlp.adapters.default_engine import StandardNlpEngine

class NlpService:
    """
    NLP Application Service orchestrating text analysis operations.
    Follows DIP by accepting an INlpEngine implementation.
    """
    def __init__(self, engine: Optional[INlpEngine] = None):
        self._engine: INlpEngine = engine or StandardNlpEngine()

    def process_complete_analysis(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            raise DomainException("El texto para analizar no puede estar vacío.", code="EMPTY_TEXT")

        clean_text = text.strip()
        sentiment = self._engine.analyze_sentiment(clean_text)
        entities = self._engine.extract_entities(clean_text)
        summary = self._engine.summarize_text(clean_text)

        return {
            "text_length": len(clean_text),
            "sentiment": sentiment,
            "entities": entities,
            "summary": summary
        }
