import re


def split_sentences(text: str) -> list[tuple[int, int, str]]:
    """
    Разбить текст на предложения.
    
    Returns:
        Список кортежей (start_pos, end_pos, sentence_text)
    """
    # Паттерн для разделения предложений: точка, !, ? за которыми пробел или конец
    pattern = re.compile(r'[.!?]+(?:\s+|$)')
    
    sentences = []
    last_end = 0
    
    for match in pattern.finditer(text):
        end = match.end()
        sentence = text[last_end:end].strip()
        if sentence:
            sentences.append((last_end, end, sentence))
        last_end = end
    
    # Остаток текста (если нет финальной пунктуации)
    if last_end < len(text):
        remainder = text[last_end:].strip()
        if remainder:
            sentences.append((last_end, len(text), remainder))
    
    return sentences


def extract_context(text: str, match_start: int, match_end: int) -> str:
    """
    Извлечь контекст: предложение до, предложение с вхождением, предложение после.
    
    Args:
        text: Полный текст параграфа
        match_start: Начальная позиция найденного числительного
        match_end: Конечная позиция найденного числительного
        
    Returns:
        Строка с 3 предложениями (или меньше, если на краю текста)
    """
    sentences = split_sentences(text)
    
    # Найти индекс предложения, содержащего вхождение
    target_idx = None
    for i, (start, end, _) in enumerate(sentences):
        if start <= match_start < end:
            target_idx = i
            break
    
    # Собрать контекст: предыдущее + текущее + следующее
    start_idx = max(0, target_idx - 1)
    end_idx = min(len(sentences), target_idx + 2)
    
    context_sentences = [s[2] for s in sentences[start_idx:end_idx]]
    return ' '.join(context_sentences)

