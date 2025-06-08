export function filterText(text) {
  const index = text.toLowerCase().indexOf('примечания');
  return index !== -1 ? text.substring(0, index).trim() : text;
}

export function splitIntoSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
}

export function cleanContext(text) {
  return text.replace(/(?:^|\s|\.)([IVXLC]+)(?:\s|$)/gi, ' ').trim();
}

export function findNumbers(text, dictionary) {
  const words = text.toLowerCase().split(/\s+/);
  const found = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?]/g, '');
    if (dictionary[word]) {
      found.push({ number: dictionary[word], word, position: i });
    }
  }
  return found;
}
