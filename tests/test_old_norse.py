import pytest

from src.languages.old_norse import OldNorseModule
from src.languages.base import NumeralMatch


class TestOldNorseModule:
    """Тесты для древнеисландского языкового модуля."""

    def setup_method(self) -> None:
        self.module = OldNorseModule()

    def test_language_code(self) -> None:
        assert self.module.language_code == "on"

    def test_language_name(self) -> None:
        assert self.module.language_name == "Old Norse"

    @pytest.mark.parametrize("word,expected_number", [
        # 1 - разные формы
        ("einn", 1),
        ("eins", 1),
        ("eitt", 1),
        ("ein", 1),
        # 2 - разные формы
        ("tveir", 2),
        ("tvá", 2),
        ("tvær", 2),
        ("tvau", 2),
        # 3
        ("þrír", 3),
        ("þrjá", 3),
        ("þrjú", 3),
        # 4
        ("fjórir", 4),
        ("fjögur", 4),
        # 5-10
        ("fimm", 5),
        ("sex", 6),
        ("sjau", 7),
        ("átta", 8),
        ("níu", 9),
        ("tíu", 10),
        # 11-12
        ("ellifu", 11),
        ("tólf", 12),
        # Десятки
        ("tuttugu", 20),
        ("þrjátigi", 30),
        ("hundrað", 100),
    ])
    def test_finds_cardinal_numerals(self, word: str, expected_number: int) -> None:
        # Setup
        text = f"Þeir váru {word} menn."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert matches[0].number_word == word
        assert matches[0].number == expected_number

    @pytest.mark.parametrize("word,expected_number", [
        ("fyrstr", 1),
        ("fyrsta", 1),
        ("annarr", 2),
        ("annat", 2),
        ("þriði", 3),
        ("fjórði", 4),
        ("fimmti", 5),
        ("sétti", 6),
        ("sjaundi", 7),
        ("áttundi", 8),
        ("níundi", 9),
        ("tíundi", 10),
        ("tólfti", 12),
    ])
    def test_finds_ordinal_numerals(self, word: str, expected_number: int) -> None:
        # Setup
        text = f"Hann var {word} til að koma."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert matches[0].number_word == word
        assert matches[0].number == expected_number

    def test_finds_multiple_numerals(self) -> None:
        # Setup - реальный текст из саги
        text = "Hann var tólf vetra gamall ok þrír menn með honum."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 2
        assert matches[0].number_word == "tólf"
        assert matches[0].number == 12
        assert matches[1].number_word == "þrír"
        assert matches[1].number == 3

    def test_returns_correct_positions(self) -> None:
        # Setup
        text = "Þeir váru tveir."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 1
        assert text[matches[0].start_pos:matches[0].end_pos] == "tveir"

    def test_case_insensitive(self) -> None:
        # Setup
        text = "EINN maðr kom. Tveir fóru."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert len(matches) == 2
        assert matches[0].number_word == "EINN"
        assert matches[0].number == 1
        assert matches[1].number_word == "Tveir"
        assert matches[1].number == 2

    def test_empty_text_returns_empty_list(self) -> None:
        # Setup
        text = ""
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert matches == []

    def test_text_without_numerals_returns_empty_list(self) -> None:
        # Setup
        text = "Maðr hét Grímr. Hann bjó á Íslandi."
        
        # Act
        matches = self.module.find_numerals(text)
        
        # Assert
        assert matches == []

