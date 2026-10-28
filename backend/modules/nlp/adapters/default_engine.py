import re
from typing import Dict, Any, List
from modules.nlp.domain.protocols import INlpEngine

class StandardNlpEngine(INlpEngine):
    """
    Standard NLP Engine implementing basic heuristics.
    Can be replaced with spaCy, Transformers, or external API adapters.
    """
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        words = text.lower().split()
        positive_keywords = {'bien', 'bueno', 'excelente', 'positivo', 'gran', 'éxito', 'correcto'}
        negative_keywords = {'mal', 'malo', 'pésimo', 'negativo', 'error', 'falla', 'problema'}

        pos_count = sum(1 for w in words if w in positive_keywords)
        neg_count = sum(1 for w in words if w in negative_keywords)

        if pos_count > neg_count:
            label = "POSITIVO"
            score = min(1.0, 0.5 + (pos_count * 0.1))
        elif neg_count > pos_count:
            label = "NEGATIVO"
            score = max(0.0, 0.5 - (neg_count * 0.1))
        else:
            label = "NEUTRO"
            score = 0.5

        return {
            "label": label,
            "score": round(score, 2),
            "tokens_count": len(words)
        }

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        # Heurística simple para palabras capitalizadas
        pattern = r'\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b'
        matches = re.finditer(pattern, text)
        entities = []
        for m in matches:
            entities.append({
                "text": m.group(),
                "start": m.start(),
                "end": m.end(),
                "type": "PROPER_NOUN"
            })
        return entities

    def summarize_text(self, text: str, max_sentences: int = 3) -> str:
        sentences = re.split(r'[.!?]+', text)
        cleaned = [s.strip() for s in sentences if s.strip()]
        selected = cleaned[:max_sentences]
        return ". ".join(selected) + ("." if selected else "")
