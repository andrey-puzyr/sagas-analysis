import { analyzeHtml, fetchContent, readLocalFile } from './analysis.js';

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const fileInput = document.getElementById('fileInput');
  const analyzeButton = document.getElementById('analyzeButton');
  const resultsBody = document.getElementById('resultsBody');
  const loadingIndicator = document.getElementById('loadingIndicator');

  function updateResultsTable(results) {
    resultsBody.innerHTML = '';
    results.forEach((res, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${res.chapter || '-'}</td>
        <td>${res.number}</td>
        <td>${res.context}</td>`;
      resultsBody.appendChild(row);
    });
  }

  analyzeButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const file = fileInput.files[0];
    if (!url && !file) {
      alert('Пожалуйста, введите URL или выберите HTML-файл для анализа');
      return;
    }

    try {
      loadingIndicator.classList.remove('hidden');
      analyzeButton.disabled = true;

      let html;
      if (file) {
        if (!file.name.match(/\.(html|htm)$/i)) throw new Error('Пожалуйста, выберите HTML-файл');
        html = await readLocalFile(file);
      } else {
        html = await fetchContent(url);
      }

      const results = analyzeHtml(html);
      updateResultsTable(results);
    } catch (err) {
      console.error('Ошибка при анализе:', err);
      alert('Произошла ошибка при анализе: ' + err.message);
    } finally {
      loadingIndicator.classList.add('hidden');
      analyzeButton.disabled = false;
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) urlInput.value = '';
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.value.trim()) fileInput.value = '';
  });
});
