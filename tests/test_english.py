import pytest

from src.languages.english import EnglishModule
from src.languages.base import NumeralMatch


class TestEnglishModule:
    """Тесты для английского языкового модуля."""

    def setup_method(self) -> None:
        self.module = EnglishModule()

    def test_language_code(self) -> None:
        assert self.module.language_code == "en"

    def test_language_name(self) -> None:
        assert self.module.language_name == "English"

    @pytest.mark.parametrize("word,expected_number", [
        ("zero", 0),
        ("one", 1),
        ("two", 2),
        ("three", 3),
        ("four", 4),
        ("five", 5),
        ("six", 6),
        ("seven", 7),
        ("eight", 8),
        ("nine", 9),
        ("ten", 10),
        ("eleven", 11),
        ("twelve", 12),
        ("thirteen", 13),
        ("fourteen", 14),
        ("fifteen", 15),
        ("sixteen", 16),
        ("seventeen", 17),
        ("eighteen", 18),
        ("nineteen", 19),
        ("twenty", 20),
        ("thirty", 30),
        ("forty", 40),
        ("fifty", 50),
        ("sixty", 60),
        ("seventy", 70),
        ("eighty", 80),
        ("ninety", 90),
        ("hundred", 100),
    ])
    def test_finds_cardinal_numerals(self, word: str, expected_number: int) -> None:
        # Setup
        text = f"There were {word} men."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert matches[0].number_word == word
        assert matches[0].number == expected_number

    @pytest.mark.parametrize("word,expected_number", [
        ("first", 1),
        ("second", 2),
        ("third", 3),
        ("fourth", 4),
        ("fifth", 5),
        ("sixth", 6),
        ("seventh", 7),
        ("eighth", 8),
        ("ninth", 9),
        ("tenth", 10),
        ("eleventh", 11),
        ("twelfth", 12),
        ("twentieth", 20),
        ("hundredth", 100),
    ])
    def test_finds_ordinal_numerals(self, word: str, expected_number: int) -> None:
        # Setup
        text = f"He was the {word} to arrive."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert matches[0].number_word == word
        assert matches[0].number == expected_number

    def test_finds_capitalized_numerals(self) -> None:
        # Setup
        text = "One man came. TWO left. Three stayed."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 3
        assert matches[0].number_word == "One"
        assert matches[1].number_word == "TWO"
        assert matches[2].number_word == "Three"

    def test_finds_multiple_numerals(self) -> None:
        # Setup
        text = "There were twelve winters and three summers."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 2
        assert matches[0].number_word == "twelve"
        assert matches[0].number == 12
        assert matches[1].number_word == "three"
        assert matches[1].number == 3

    def test_returns_correct_positions(self) -> None:
        # Setup
        text = "I have two apples."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert matches[0].start_pos == 7
        assert matches[0].end_pos == 10
        assert text[7:10] == "two"

    def test_respects_word_boundaries(self) -> None:
        # Setup - "one" не должен находиться в "stone", "done", "gone"
        text = "The stone was done and gone."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 0

    def test_empty_text_returns_empty_list(self) -> None:
        # Setup
        text = ""
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert matches == []

    def test_text_without_numerals_returns_empty_list(self) -> None:
        # Setup
        text = "The man went to the market and bought some bread."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert matches == []

