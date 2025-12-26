import re
from .base import LanguageModule, NumeralMatch


class OldNorseModule(LanguageModule):
    """Модуль для поиска древнеисландских числительных (0-1000)."""
    
    NUMERALS: dict[str, int] = {
        # 0 (редко, но для полноты)
        # 1 - einn (м.р.), ein (ж.р.), eitt (ср.р.) + падежи
        "einn": 1, "eins": 1, "einum": 1, "eitt": 1, "ein": 1,
        "einni": 1, "eina": 1, "einu": 1, "einnar": 1, "einna": 1,
        "einir": 1, "einar": 1,
        # 2 - tveir (м.р.), tvær (ж.р.), tvau (ср.р.)
        "tveir": 2, "tveggja": 2, "tveim": 2, "tvá": 2,
        "tvær": 2, "tvau": 2, "tveim": 2, "tveimr": 2,
        # 3
        "þrír": 3, "þriggja": 3, "þrim": 3, "þrjá": 3,
        "þrjár": 3, "þrjú": 3, "þrimr": 3,
        # 4
        "fjórir": 4, "fjögurra": 4, "fjórum": 4, "fjóra": 4,
        "fjórar": 4, "fjögur": 4,
        # 5
        "fimm": 5, "fimmt": 5,
        # 6
        "sex": 6,
        # 7
        "sjau": 7, "sjö": 7,
        # 8
        "átta": 8,
        # 9
        "níu": 9,
        # 10
        "tíu": 10,
        # 11
        "ellifu": 11, "ellefu": 11,
        # 12
        "tólf": 12,
        # 13
        "þrettán": 13,
        # 14
        "fjórtán": 14,
        # 15
        "fimmtán": 15,
        # 16
        "sextán": 16,
        # 17
        "sjautján": 17, "sautján": 17,
        # 18
        "átján": 18,
        # 19
        "nítján": 19,
        # 20
        "tuttugu": 20, "tuttigo": 20,
        # 30
        "þrjátigi": 30, "þrjátíu": 30, "þrjátugu": 30,
        # 40
        "fjórutigi": 40, "fjórutíu": 40, "fjörutíu": 40,
        # 50
        "fimmtigi": 50, "fimmtíu": 50,
        # 60
        "sextigi": 60, "sextíu": 60,
        # 70
        "sjautigi": 70, "sjautíu": 70, "sjötíu": 70,
        # 80
        "áttatigi": 80, "áttatíu": 80,
        # 90
        "níutigi": 90, "níutíu": 90,
        # 100
        "hundrað": 100, "hundraði": 100, "hundraðs": 100,
        "tírætt": 100, "tíræðr": 100,
        # 1000
        "þúsund": 1000, "þúsundir": 1000, "þúsunda": 1000,
        
        # Порядковые числительные
        # 1-й
        "fyrstr": 1, "fyrsta": 1, "fyrstu": 1, "fyrst": 1,
        "fyrstum": 1, "fyrstan": 1, "fyrstrar": 1, "fyrsti": 1,
        # 2-й
        "annarr": 2, "annat": 2, "annan": 2, "annari": 2,
        "annarri": 2, "öðrum": 2, "annars": 2, "annarrar": 2,
        "önnur": 2, "aðra": 2, "aðrir": 2, "aðrar": 2, "önnuru": 2,
        # 3-й
        "þriði": 3, "þriðja": 3, "þriðji": 3, "þriðju": 3,
        # 4-й
        "fjórði": 4, "fjórða": 4, "fjórðu": 4,
        # 5-й
        "fimmti": 5, "fimmta": 5, "fimmtu": 5,
        # 6-й
        "sétti": 6, "sétta": 6, "séttu": 6,
        # 7-й
        "sjaundi": 7, "sjöundi": 7, "sjaunda": 7, "sjöunda": 7,
        # 8-й
        "áttundi": 8, "áttunda": 8,
        # 9-й
        "níundi": 9, "níunda": 9,
        # 10-й
        "tíundi": 10, "tíunda": 10,
        # 11-й
        "ellefti": 11, "ellefta": 11,
        # 12-й
        "tólfti": 12, "tólfta": 12,
    }
    
    def __init__(self) -> None:
        # Компилируем паттерн для всех числительных (сортировка по длине для greedy match)
        sorted_words = sorted(self.NUMERALS.keys(), key=len, reverse=True)
        pattern = r'\b(' + '|'.join(re.escape(w) for w in sorted_words) + r')\b'
        self._pattern = re.compile(pattern, re.IGNORECASE)
    
    @property
    def language_code(self) -> str:
        return "on"
    
    @property
    def language_name(self) -> str:
        return "Old Norse"
    
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

