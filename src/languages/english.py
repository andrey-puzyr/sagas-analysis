import re
from .base import LanguageModule, NumeralMatch


class EnglishModule(LanguageModule):
    """Модуль для поиска английских числительных (0-1000)."""
    
    NUMERALS: dict[str, int] = {
        # 0
        "zero": 0,
        # 1-19
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
        "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
        "nineteen": 19,
        # Десятки
        "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
        "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
        # Сотни
        "hundred": 100,
        "thousand": 1000,
        # Порядковые
        "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5,
        "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10,
        "eleventh": 11, "twelfth": 12, "thirteenth": 13, "fourteenth": 14,
        "fifteenth": 15, "sixteenth": 16, "seventeenth": 17, "eighteenth": 18,
        "nineteenth": 19, "twentieth": 20, "thirtieth": 30, "fortieth": 40,
        "fiftieth": 50, "sixtieth": 60, "seventieth": 70, "eightieth": 80,
        "ninetieth": 90, "hundredth": 100, "thousandth": 1000,
    }
    
    def __init__(self) -> None:
        # Компилируем паттерн для всех числительных (сортировка по длине для greedy match)
        sorted_words = sorted(self.NUMERALS.keys(), key=len, reverse=True)
        pattern = r'\b(' + '|'.join(re.escape(w) for w in sorted_words) + r')\b'
        self._pattern = re.compile(pattern, re.IGNORECASE)
    
    @property
    def language_code(self) -> str:
        return "en"
    
    @property
    def language_name(self) -> str:
        return "English"
    
    def find_numerals(self, text: str) -> list[NumeralMatch]:
        matches = []
        for match in self._pattern.finditer(text):
            original_word = match.group(0)
            number = self.NUMERALS[original_word.lower()]
            matches.append(NumeralMatch(
                number_word=original_word,
                number=number,
                start_pos=match.start(),
                end_pos=match.end()
            ))
        return matches

