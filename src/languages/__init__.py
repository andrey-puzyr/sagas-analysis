from .base import LanguageModule, NumeralMatch
from .english import EnglishModule
from .old_norse import OldNorseModule

LANGUAGE_REGISTRY: dict[str, type[LanguageModule]] = {
    "en": EnglishModule,
    "on": OldNorseModule,
}


def get_module_for_file(filename: str) -> LanguageModule:
    """
    Получить языковой модуль по имени файла.
    
    filename: "saga.en.xml" → вернёт EnglishModule()
    """
    parts = filename.rsplit('.', 2)
    lang_code = parts[-2]
    return LANGUAGE_REGISTRY[lang_code]()

