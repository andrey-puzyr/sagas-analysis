import csv
import glob
import sys
from dataclasses import dataclass
from pathlib import Path

from .xml_parser import parse_saga
from .context_extractor import extract_context
from .languages import get_module_for_file


@dataclass
class NumeralResult:
    """Результат поиска числительного."""
    number_word: str
    number: int
    context: str
    chapter: int
    saga: str
    lang: str
    url: str


def process_file(filepath: str) -> list[NumeralResult]:
    """Обработать один XML файл."""
    filename = Path(filepath).name
    saga = parse_saga(filepath)
    module = get_module_for_file(filename)
    
    results = []
    
    for chapter in saga.chapters:
        url = f"https://sagadb.org/files/html/{saga.basename}.html#{chapter.number}"
        
        for paragraph in chapter.paragraphs:
            matches = module.find_numerals(paragraph)
            
            for match in matches:
                context = extract_context(
                    paragraph, 
                    match.start_pos, 
                    match.end_pos
                )
                
                results.append(NumeralResult(
                    number_word=match.number_word,
                    number=match.number,
                    context=context,
                    chapter=chapter.number,
                    saga=saga.basename,
                    lang=module.language_code,
                    url=url
                ))
    
    return results


def main() -> None:
    """Точка входа."""
    patterns = sys.argv[1:]
    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))
    
    all_results: list[NumeralResult] = []
    
    for filepath in files:
        results = process_file(filepath)
        all_results.extend(results)
    
    # Вывод CSV в консоль
    writer = csv.writer(sys.stdout, delimiter=';')
    writer.writerow(['number_word', 'number', 'context', 'chapter', 'saga', 'lang', 'url'])
    
    for result in all_results:
        writer.writerow([
            result.number_word.lower(),
            result.number,
            result.context,
            result.chapter,
            result.saga,
            result.lang,
            result.url
        ])


if __name__ == "__main__":
    main()

