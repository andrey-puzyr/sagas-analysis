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
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style tags
    const scriptsAndStyles = doc.querySelectorAll('script, style');
    scriptsAndStyles.forEach(el => el.remove());
    
    // Find the notes section and remove everything after it
    const notesHeaders = doc.querySelectorAll('h2');
    for (const header of notesHeaders) {
      if (header.textContent.trim() === 'Примечания') {
        // Remove all following siblings
        let nextSibling = header.nextElementSibling;
        while (nextSibling) {
          const toRemove = nextSibling;
          nextSibling = nextSibling.nextElementSibling;
          toRemove.remove();
        }
        header.remove();
        break;
      }
    }
    
    // Extract saga title
    const sagaTitleEl = doc.querySelector('h1');
    const sagaTitle = sagaTitleEl ? sagaTitleEl.textContent.trim() : '';
    
    // Find all chapter headers (h3 with roman numeral IDs)
    const chapters = {};
    const chapterHeaders = doc.querySelectorAll('h3[id]');
    
    for (const header of chapterHeaders) {
      const chapterNumber = header.getAttribute('id');
      
      // Check if the ID is a roman numeral
      if (!Object.values(this.romanNumerals).includes(chapterNumber)) {
        continue;
      }
      
      // Get all content between this header and the next header
      let content = '';
      let current = header.nextElementSibling;
      
      while (current && current.tagName !== 'H3') {
        if (current.tagName === 'P') {
          // Clean the paragraph content
          const cleanedContent = this.cleanParagraph(current);
          if (cleanedContent.trim()) {
            content += cleanedContent + ' ';
          }
        }
        current = current.nextElementSibling;
      }
      
      // Split content into sentences
      const sentences = this.splitIntoSentences(content.trim());
      chapters[chapterNumber] = sentences;
    }
    
    return chapters;
  }
  
  cleanParagraph(paragraph) {
    // Clone the paragraph to avoid modifying the original
    const clone = paragraph.cloneNode(true);
    
    // Remove footnote links
    const noteLinks = clone.querySelectorAll('a.note');
    noteLinks.forEach(link => link.remove());
    
    // Remove image containers
    const imageContainers = clone.querySelectorAll('div.imgcenter, div.imgleft300, div.imgright');
    imageContainers.forEach(container => container.remove());
    
    // Remove all img tags
    const images = clone.querySelectorAll('img');
    images.forEach(img => img.remove());
    
    // Get text content and normalize whitespace
    return clone.textContent.replace(/\s+/g, ' ').trim();
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