class SagaParserApp {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.parseButton = document.getElementById('parseButton');
    this.resultsSection = document.getElementById('resultsSection');
    this.errorSection = document.getElementById('errorSection');
    this.jsonOutput = document.getElementById('jsonOutput');
    this.downloadButton = document.getElementById('downloadButton');
    this.errorMessage = document.getElementById('errorMessage');
    this.fileInputLabel = document.querySelector('.file-input-label');
    this.fileTextSpan = document.querySelector('.file-text');
    
    this.selectedFile = null;
    this.parsedData = null;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.parseButton.addEventListener('click', () => this.parseFile());
    this.downloadButton.addEventListener('click', () => this.downloadJSON());
  }
  
  handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
      this.resetFileSelection();
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      this.showError('Пожалуйста, выберите HTML файл (.html или .htm)');
      this.resetFileSelection();
      return;
    }
    
    this.selectedFile = file;
    this.fileInputLabel.classList.add('file-selected');
    this.fileTextSpan.textContent = `Выбран: ${file.name}`;
    this.parseButton.disabled = false;
    this.hideError();
  }
  
  resetFileSelection() {
    this.selectedFile = null;
    this.fileInputLabel.classList.remove('file-selected');
    this.fileTextSpan.textContent = 'Выберите HTML файл саги';
    this.parseButton.disabled = true;
    this.hideResults();
  }
  
  async parseFile() {
    if (!this.selectedFile) {
      this.showError('Файл не выбран');
      return;
    }
    
    try {
      this.parseButton.disabled = true;
      this.parseButton.textContent = 'Обработка...';
      this.hideError();
      
      // Read file content
      const htmlContent = await this.readFileAsText(this.selectedFile);
      
      // Parse with SagaParser
      const parser = new SagaParser();
      const result = parser.parse(htmlContent);
      
      // Check if we got any chapters
      if (Object.keys(result).length === 0) {
        throw new Error('Не найдено ни одной главы с римскими номерами. Убедитесь, что файл содержит правильную структуру саги.');
      }
      
      this.parsedData = result;
      this.displayResults(result);
      
    } catch (error) {
      console.error('Parsing error:', error);
      this.showError(`Ошибка при парсинге файла: ${error.message}`);
    } finally {
      this.parseButton.disabled = false;
      this.parseButton.textContent = 'Парсить сагу';
    }
  }
  
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file, 'utf-8');
    });
  }
  
  displayResults(data) {
    const jsonString = JSON.stringify(data, null, 2);
    this.jsonOutput.innerHTML = `<pre>${this.escapeHtml(jsonString)}</pre>`;
    this.resultsSection.style.display = 'block';
    
    // Scroll to results
    this.resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  downloadJSON() {
    if (!this.parsedData) {
      this.showError('Нет данных для скачивания');
      return;
    }
    
    const jsonString = JSON.stringify(this.parsedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedFile.name}_parsed.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorSection.style.display = 'block';
    this.errorSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  hideError() {
    this.errorSection.style.display = 'none';
  }
  
  hideResults() {
    this.resultsSection.style.display = 'none';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SagaParserApp();
});