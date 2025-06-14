const cheerio = require('cheerio');

class SagaParser {
  constructor() {
    this.romanNumerals = this.generateRomanNumerals();
  }

  generateRomanNumerals() {
    const romanMap = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
      11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX',
      21: 'XXI', 22: 'XXII', 23: 'XXIII', 24: 'XXIV', 25: 'XXV', 26: 'XXVI', 27: 'XXVII', 28: 'XXVIII', 29: 'XXIX', 30: 'XXX',
      31: 'XXXI', 32: 'XXXII', 33: 'XXXIII', 34: 'XXXIV', 35: 'XXXV', 36: 'XXXVI', 37: 'XXXVII', 38: 'XXXVIII', 39: 'XXXIX', 40: 'XL',
      41: 'XLI', 42: 'XLII', 43: 'XLIII', 44: 'XLIV', 45: 'XLV', 46: 'XLVI', 47: 'XLVII', 48: 'XLVIII', 49: 'XLIX', 50: 'L'
    };
    return romanMap;
  }

  parse(htmlContent) {
    const $ = cheerio.load(htmlContent);
    
    // Remove script and style tags
    $('script, style').remove();
    
    // Find the notes section and remove everything after it
    const notesHeader = $('h2').filter((i, el) => $(el).text().trim() === 'Примечания');
    if (notesHeader.length > 0) {
      notesHeader.nextAll().remove();
      notesHeader.remove();
    }
    
    // Extract saga title
    const sagaTitle = $('h1').first().text().trim();
    
    // Find all chapter headers (h3 with roman numeral IDs)
    const chapters = {};
    const chapterHeaders = $('h3').filter((i, el) => {
      const id = $(el).attr('id');
      return id && Object.values(this.romanNumerals).includes(id);
    });
    
    chapterHeaders.each((i, header) => {
      const $header = $(header);
      const chapterNumber = $header.attr('id');
      
      // Get all content between this header and the next header
      let content = '';
      let current = $header.next();
      
      while (current.length > 0 && current.get(0).tagName !== 'h3') {
        if (current.get(0).tagName === 'p') {
          // Clean the paragraph content
          const cleanedContent = this.cleanParagraph(current);
          if (cleanedContent.trim()) {
            content += cleanedContent + ' ';
          }
        }
        current = current.next();
      }
      
      // Split content into sentences
      const sentences = this.splitIntoSentences(content.trim());
      chapters[chapterNumber] = sentences;
    });
    
    return chapters;
  }
  
  cleanParagraph($paragraph) {
    // Clone the paragraph to avoid modifying the original
    const $clone = $paragraph.clone();
    
    // Remove footnote links
    $clone.find('a.note').remove();
    
    // Remove image containers
    $clone.find('div.imgcenter, div.imgleft300, div.imgright').remove();
    
    // Remove all img tags
    $clone.find('img').remove();
    
    // Get text content and normalize whitespace
    return $clone.text().replace(/\s+/g, ' ').trim();
  }
  
  splitIntoSentences(text) {
    if (!text) return [];
    
    // Split by sentence-ending punctuation followed by whitespace or end of string
    const parts = text.split(/([.!?])(\s+|$)/);
    const sentences = [];
    
    for (let i = 0; i < parts.length; i += 3) {
      const textPart = parts[i];
      const punctuation = parts[i + 1];
      
      if (textPart && textPart.trim()) {
        if (punctuation && /[.!?]/.test(punctuation)) {
          // Has punctuation
          sentences.push(textPart.trim() + punctuation);
        } else {
          // No punctuation, add period
          sentences.push(textPart.trim() + '.');
        }
      }
    }
    
    return sentences.filter(sentence => sentence.length > 0);
  }
}

module.exports = SagaParser;