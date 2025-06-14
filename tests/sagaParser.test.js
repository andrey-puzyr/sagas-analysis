const fs = require('fs');
const path = require('path');
const SagaParser = require('../src/sagaParser');

describe('SagaParser', () => {
  let parser;
  let testHtmlContent;

  beforeAll(() => {
    parser = new SagaParser();
    // Load real HTML file for testing
    const testFilePath = path.join(__dirname, '../data/Сага об Инглингах.htm');
    testHtmlContent = fs.readFileSync(testFilePath, 'utf8');
  });

  describe('parse', () => {
    test('should parse real saga HTML file successfully', () => {
      const result = parser.parse(testHtmlContent);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // Should have chapter keys
      expect(Object.keys(result).length).toBeGreaterThan(0);
      
      // Check for expected chapters (Roman numerals I through L)
      expect(result).toHaveProperty('I');
      expect(result).toHaveProperty('X');
      expect(result).toHaveProperty('L'); // Last chapter
      
      // Each chapter should be an array of sentences
      expect(Array.isArray(result.I)).toBe(true);
      expect(result.I.length).toBeGreaterThan(0);
    });

    test('should extract correct content from first chapter', () => {
      const result = parser.parse(testHtmlContent);
      const firstChapter = result.I;
      
      expect(firstChapter).toBeDefined();
      expect(Array.isArray(firstChapter)).toBe(true);
      expect(firstChapter.length).toBeGreaterThan(0);
      
      // Check first sentence contains expected content
      expect(firstChapter[0]).toContain('Круг Земной');
      
      // All sentences should end with period
      firstChapter.forEach(sentence => {
        expect(sentence).toMatch(/[.!?]$/);
      });
    });

    test('should remove footnote links from content', () => {
      const result = parser.parse(testHtmlContent);
      
      // Check that no chapter contains footnote markers like "1", "2", etc. in isolation
      Object.values(result).forEach(chapter => {
        chapter.forEach(sentence => {
          // Should not contain standalone numbers that were footnotes
          expect(sentence).not.toMatch(/\s\d+\s/);
        });
      });
    });

    test('should not include content after "Примечания" section', () => {
      const result = parser.parse(testHtmlContent);
      
      // The notes section should not be included as chapters
      const allText = Object.values(result).flat().join(' ');
      
      // Should not contain typical notes section markers
      expect(allText).not.toContain('Примечания');
      
      // Test that the parser correctly stops at the notes section
      // by checking the content doesn't contain notes-specific text patterns
      const notesPattern = /[12]\s*Танаис/; // Notes typically start with numbered references
      expect(allText).not.toMatch(notesPattern);
    });

    test('should have exactly 50 chapters (I to L)', () => {
      const result = parser.parse(testHtmlContent);
      const chapterKeys = Object.keys(result);
      
      // Should have 50 chapters
      expect(chapterKeys.length).toBe(50);
      
      // Check specific chapters exist
      expect(result).toHaveProperty('I');
      expect(result).toHaveProperty('V');
      expect(result).toHaveProperty('X');
      expect(result).toHaveProperty('XX');
      expect(result).toHaveProperty('XXX');
      expect(result).toHaveProperty('XL');
      expect(result).toHaveProperty('L');
    });

    test('should split content into proper sentences', () => {
      const result = parser.parse(testHtmlContent);
      
      // Test a few chapters to ensure proper sentence splitting
      const testChapters = ['I', 'II', 'V'];
      
      testChapters.forEach(chapterKey => {
        if (result[chapterKey]) {
          const chapter = result[chapterKey];
          expect(Array.isArray(chapter)).toBe(true);
          expect(chapter.length).toBeGreaterThan(0);
          
          chapter.forEach(sentence => {
            expect(typeof sentence).toBe('string');
            expect(sentence.length).toBeGreaterThan(0);
            expect(sentence.trim()).toBe(sentence); // No leading/trailing whitespace
          });
        }
      });
    });
  });

  describe('cleanParagraph', () => {
    test('should remove footnote links', () => {
      const mockHtml = '<p>Текст с <a href="#_edn1" class="note">1</a> сносками.</p>';
      const $ = require('cheerio').load(mockHtml);
      const cleaned = parser.cleanParagraph($('p'));
      
      expect(cleaned).toBe('Текст с сносками.');
      expect(cleaned).not.toContain('1');
    });

    test('should normalize whitespace', () => {
      const mockHtml = '<p>Текст   с    многими     пробелами.</p>';
      const $ = require('cheerio').load(mockHtml);
      const cleaned = parser.cleanParagraph($('p'));
      
      expect(cleaned).toBe('Текст с многими пробелами.');
    });
  });

  describe('splitIntoSentences', () => {
    test('should split text by periods correctly', () => {
      const text = 'Первое предложение. Второе предложение. Третье предложение';
      const sentences = parser.splitIntoSentences(text);
      
      expect(sentences).toHaveLength(3);
      expect(sentences[0]).toBe('Первое предложение.');
      expect(sentences[1]).toBe('Второе предложение.');
      expect(sentences[2]).toBe('Третье предложение.');
    });

    test('should handle empty or undefined text', () => {
      expect(parser.splitIntoSentences('')).toEqual([]);
      expect(parser.splitIntoSentences(null)).toEqual([]);
      expect(parser.splitIntoSentences(undefined)).toEqual([]);
    });

    test('should preserve existing punctuation at end', () => {
      const text = 'Вопрос? Восклицание! Обычное предложение.';
      const sentences = parser.splitIntoSentences(text);
      
      expect(sentences[0]).toBe('Вопрос?');
      expect(sentences[1]).toBe('Восклицание!');
      expect(sentences[2]).toBe('Обычное предложение.');
    });
  });

  describe('edge cases', () => {
    test('should handle empty HTML', () => {
      const result = parser.parse('<html><body></body></html>');
      expect(result).toEqual({});
    });

    test('should handle HTML without chapters', () => {
      const html = '<html><body><h1>Title</h1><p>Some text</p></body></html>';
      const result = parser.parse(html);
      expect(result).toEqual({});
    });

    test('should handle malformed HTML gracefully', () => {
      const html = '<html><body><h1>Title<h3 id="I">I</h3><p>Text</p></body></html>';
      const result = parser.parse(html);
      expect(result).toHaveProperty('I');
      expect(result.I).toContain('Text.');
    });
  });
});