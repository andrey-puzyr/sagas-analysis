import pytest

from src.context_extractor import split_sentences, extract_context


class TestSplitSentences:
    """Тесты разбиения текста на предложения."""

    def test_splits_by_period(self) -> None:
        text = "First sentence. Second sentence. Third sentence."
        sentences = split_sentences(text)
        
        assert len(sentences) == 3
        assert sentences[0][2] == "First sentence."
        assert sentences[1][2] == "Second sentence."
        assert sentences[2][2] == "Third sentence."

    def test_splits_by_exclamation(self) -> None:
        text = "Hello! How are you?"
        sentences = split_sentences(text)
        
        assert len(sentences) == 2

    def test_handles_text_without_ending_punctuation(self) -> None:
        text = "First sentence. Second without period"
        sentences = split_sentences(text)
        
        assert len(sentences) == 2
        assert sentences[1][2] == "Second without period"


class TestExtractContext:
    """Тесты извлечения контекста."""

    def test_extracts_three_sentences(self) -> None:
        # Setup
        text = "Before. Target word here. After."
        # "word" начинается на позиции 15
        
        # Act
        context = extract_context(text, 15, 19)
        
        # Assert
        assert "Before." in context
        assert "**word**" in context
        assert "After." in context

    def test_extracts_context_at_beginning(self) -> None:
        # Setup
        text = "First sentence with target. Second. Third."
        
        # Act - "target" на позиции 20
        context = extract_context(text, 20, 26)
        
        # Assert - нет предложения до, только текущее и следующее
        assert "**target**" in context
        assert "Second." in context

    def test_extracts_context_at_end(self) -> None:
        # Setup
        text = "First. Second. Third sentence with target."
        
        # Act - "target" начинается на позиции 35
        context = extract_context(text, 35, 41)
        
        # Assert - нет предложения после, только предыдущее и текущее
        assert "Second." in context
        assert "**target**" in context

    def test_single_sentence_text(self) -> None:
        # Setup
        text = "Only one sentence here."
        
        # Act
        context = extract_context(text, 5, 8)
        
        # Assert
        assert "Only **one** sentence here." in context

    def test_highlights_match_with_markers(self) -> None:
        # Setup
        text = "There were twelve men."
        
        # Act
        context = extract_context(text, 11, 17)
        
        # Assert
        assert "**twelve**" in context

    @pytest.mark.parametrize("match_pos,expected_sentences", [
        (0, 2),   # начало - текущее + следующее
        (8, 3),   # середина - все три
        (15, 2),  # конец - предыдущее + текущее (Third начинается с 15)
    ])
    def test_context_size_depends_on_position(
        self, match_pos: int, expected_sentences: int
    ) -> None:
        # Setup
        text = "First. Second. Third."
        
        # Act
        context = extract_context(text, match_pos, match_pos + 1)
        
        # Assert - проверяем количество точек
        assert context.count('.') == expected_sentences

