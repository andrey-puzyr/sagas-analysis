document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const fileInput = document.getElementById('fileInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultsBody = document.getElementById('resultsBody');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Структура для хранения результатов анализа
    let analysisResults = [];

    // Функция получения HTML-контента по URL
    async function fetchContent(url) {
        try {
            // Проверка формата URL
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                throw new Error('URL должен начинаться с http:// или https://');
            }

            // Проверка доступности URL
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/html'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('text/html')) {
                throw new Error('Полученный контент не является HTML');
            }

            return await response.text();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Ошибка сети: невозможно получить доступ к ресурсу. Возможно, проблема с CORS или сайт недоступен.');
            }
            throw new Error(`Ошибка при получении контента: ${error.message}`);
        }
    }

    // Функция чтения локального файла
    function readLocalFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(new Error('Ошибка при чтении файла: ' + error.message));
            };
            
            reader.readAsText(file);
        });
    }

    // Функция извлечения чистого текста из HTML
    function extractText(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    // Функция извлечения структуры глав из HTML
    function extractChapters(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const chapters = [];
        
        // Находим все заголовки h3
        const headers = doc.getElementsByTagName('h3');
        for (let header of headers) {
            const text = header.textContent.trim();
            // Ищем римскую цифру в тексте заголовка
            const romanMatch = text.match(/\b[IVXLC]+\b/);
            if (romanMatch && romanNumerals[romanMatch[0]]) {
                chapters.push({
                    numeral: romanMatch[0],
                    element: header
                });
            }
        }
        
        return chapters;
    }

    // Функция определения главы для предложения
    function findChapterForSentence(sentence, chapters, html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Создаем временный элемент для предложения
        const tempDiv = document.createElement('div');
        tempDiv.textContent = sentence;
        
        // Находим позицию предложения в документе
        const sentencePosition = html.indexOf(sentence);
        if (sentencePosition === -1) return null;
        
        // Ищем последнюю главу перед предложением
        let lastChapter = null;
        for (let chapter of chapters) {
            const chapterPosition = html.indexOf(chapter.element.outerHTML);
            if (chapterPosition !== -1 && chapterPosition < sentencePosition) {
                lastChapter = chapter.numeral;
            }
        }
        
        return lastChapter;
    }

    // Функция фильтрации текста (удаление всего после "Примечания")
    function filterText(text) {
        const notesIndex = text.toLowerCase().indexOf('примечания');
        if (notesIndex !== -1) {
            return text.substring(0, notesIndex).trim();
        }
        return text;
    }

    // Функция разбиения текста на предложения
    function splitIntoSentences(text) {
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    }

    // Функция поиска римских цифр (глав) в тексте
    function findRomanNumerals(text) {
        // Ищем римские цифры в начале строки или после точки/пробела
        const romanNumeralRegex = /(?:^|\s|\.)([IVXLC]+)(?:\s|$)/g;
        const matches = [];
        let match;
        
        while ((match = romanNumeralRegex.exec(text)) !== null) {
            const numeral = match[1];
            // Проверяем, что это действительно римское число
            if (romanNumerals[numeral]) {
                matches.push({
                    numeral,
                    value: romanNumerals[numeral],
                    position: match.index
                });
            }
        }
        
        return matches;
    }

    // Функция очистки контекста от римских цифр
    function cleanContext(text) {
        // Удаляем римские цифры в начале строки или после точки/пробела
        return text.replace(/(?:^|\s|\.)([IVXLC]+)(?:\s|$)/g, ' ').trim();
    }

    // Функция поиска числительных в тексте
    function findNumbers(text) {
        const words = text.toLowerCase().split(/\s+/);
        const foundNumbers = [];
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[.,!?]/g, '');
            if (numbers[word]) {
                foundNumbers.push({
                    number: numbers[word],
                    word: word,
                    position: i
                });
            }
        }
        
        return foundNumbers;
    }

    // Функция связывания числительных с главами
    function linkNumbersWithChapters(sentences, html) {
        const chapters = extractChapters(html);
        const results = [];

        sentences.forEach((sentence) => {
            const currentChapter = findChapterForSentence(sentence, chapters, html);
            
            // Поиск числительных в предложении
            const foundNumbers = findNumbers(sentence);
            foundNumbers.forEach(number => {
                results.push({
                    chapter: currentChapter,
                    number: number.number,
                    context: cleanContext(sentence.trim())
                });
            });
        });

        return results;
    }

    // Функция обновления таблицы результатов
    function updateResultsTable(results) {
        resultsBody.innerHTML = '';
        results.forEach((result, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${result.chapter || '-'}</td>
                <td>${result.number}</td>
                <td>${result.context}</td>
            `;
            resultsBody.appendChild(row);
        });
    }

    // Обработчик клика по кнопке анализа
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
                if (!file.name.match(/\.(html|htm)$/i)) {
                    throw new Error('Пожалуйста, выберите HTML-файл');
                }
                html = await readLocalFile(file);
            } else {
                html = await fetchContent(url);
            }

            const text = extractText(html);
            const filteredText = filterText(text);
            const sentences = splitIntoSentences(filteredText);
            analysisResults = linkNumbersWithChapters(sentences, html);
            
            updateResultsTable(analysisResults);
        } catch (error) {
            console.error('Ошибка при анализе:', error);
            alert('Произошла ошибка при анализе: ' + error.message);
        } finally {
            loadingIndicator.classList.add('hidden');
            analyzeButton.disabled = false;
        }
    });

    // Очистка URL при выборе файла
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            urlInput.value = '';
        }
    });

    // Очистка файла при вводе URL
    urlInput.addEventListener('input', () => {
        if (urlInput.value.trim()) {
            fileInput.value = '';
        }
    });
}); 