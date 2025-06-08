import { numbers, romanNumerals } from './numbers.js';
import { filterText, splitIntoSentences, findNumbers, cleanContext } from './textUtils.js';

export async function fetchContent(url) {
  const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.text();
}

export function readLocalFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = err => reject(new Error('Ошибка при чтении файла: ' + err.message));
    reader.readAsText(file);
  });
}

export function extractText(html) {
  return html.replace(/<[^>]*>/g, ' ');
}

export function extractChapters(html) {
  const regex = /<h3[^>]*>(.*?)<\/h3>/gi;
  const chapters = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1];
    const roman = text.match(/\b[IVXLC]+\b/);
    if (roman && romanNumerals[roman[0]]) {
      chapters.push({ numeral: roman[0], position: match.index });
    }
  }
  return chapters;
}

export function findChapterForSentence(sentence, chapters, html) {
  const pos = html.indexOf(sentence);
  if (pos === -1) return null;
  let last = null;
  for (const ch of chapters) {
    if (ch.position < pos) last = ch.numeral; else break;
  }
  return last;
}

export function linkNumbersWithChapters(sentences, html) {
  const chapters = extractChapters(html);
  const results = [];
  sentences.forEach(sentence => {
    const chap = findChapterForSentence(sentence, chapters, html);
    const nums = findNumbers(sentence, numbers);
    nums.forEach(n => {
      results.push({ chapter: chap, number: n.number, context: cleanContext(sentence.trim()) });
    });
  });
  return results;
}

export function analyzeHtml(html) {
  const text = extractText(html);
  const filtered = filterText(text);
  const sentences = splitIntoSentences(filtered);
  return linkNumbersWithChapters(sentences, html);
}
