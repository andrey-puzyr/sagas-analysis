from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class NumeralMatch:
    """Результат нахождения числительного в тексте."""
    number_word: str      # Слово как в тексте ("twelve", "tólf")
    number: int           # Числовое значение (12)
    start_pos: int        # Начальная позиция в тексте
    end_pos: int          # Конечная позиция в тексте


class LanguageModule(ABC):
    """Базовый класс для языковых модулей."""
    
    @property
    @abstractmethod
    def language_code(self) -> str:
        """Код языка (расширение файла без точки): 'en', 'on'."""
        pass
    
    @property
    @abstractmethod
    def language_name(self) -> str:
        """Человекочитаемое название языка."""
        pass
    
    @abstractmethod
    def find_numerals(self, text: str) -> list[NumeralMatch]:
        """
        Найти все числительные в тексте.
        
        Args:
            text: Текст для анализа
            
        Returns:
            Список найденных числительных с позициями, отсортированный по позиции
        """
        pass

