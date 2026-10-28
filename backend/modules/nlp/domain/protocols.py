from typing import Protocol, Dict, Any, List

class INlpEngine(Protocol):
    """Protocol for pluggable NLP engines and providers."""

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyzes polarity and subjectivity or sentiment category."""
        ...

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extracts named entities from text."""
        ...

    def summarize_text(self, text: str, max_sentences: int = 3) -> str:
        """Generates summary from input text."""
        ...
