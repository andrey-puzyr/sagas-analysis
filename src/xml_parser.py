from dataclasses import dataclass
from lxml import etree


@dataclass
class Chapter:
    """Глава саги."""
    number: int
    title: str
    paragraphs: list[str]


@dataclass
class Saga:
    """Распарсенная сага."""
    basename: str
    language_iso: str
    chapters: list[Chapter]


def parse_saga(filepath: str) -> Saga:
    """
    Парсинг XML файла саги.
    
    Args:
        filepath: Путь к XML файлу
        
    Returns:
        Saga с главами и параграфами
    """
    tree = etree.parse(filepath)
    root = tree.getroot()
    
    # Метаданные
    metadata = root.find("metadata")
    basename = metadata.findtext("basename")
    language_iso = metadata.findtext("language_iso")
    
    # Главы
    chapters = []
    content = root.find("content")
    for chapter_elem in content.findall("chapter"):
        chapter_number = int(chapter_elem.get("number"))
        chapter_title = chapter_elem.get("title")
        
        paragraphs = [p.text for p in chapter_elem.findall("paragraph")]
        
        chapters.append(Chapter(
            number=chapter_number,
            title=chapter_title,
            paragraphs=paragraphs
        ))
    
    return Saga(
        basename=basename,
        language_iso=language_iso,
        chapters=chapters
    )

