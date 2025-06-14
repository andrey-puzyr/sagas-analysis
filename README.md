# Saga Parser

Парсер для древнеисландских саг в формате HTML с преобразованием в структурированный JSON.

## Описание

Это приложение Node.js извлекает структурированные данные из HTML файлов древнеисландских саг и преобразует их в JSON формат:

```json
{
  "I": ["sentence1", "sentence2", "sentence3"],
  "II": ["sentence1", "sentence2"],
  ...
}
```

### Особенности парсинга

- **Структура саг**: тег `h1` - название саги, теги `h3` - названия глав (римские цифры)
- **Фильтрация контента**: автоматически удаляются изображения, сноски (href ссылки), раздел "Примечания"
- **Разбиение на предложения**: текст разбивается на отдельные предложения по точкам
- **Ключи JSON**: используются римские цифры (I, II, III...) как названия глав

## Требования

- Node.js >= 16.0.0
- Docker (опционально)

## Установка

### Локальная установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd sagas-analysis

# Установить зависимости
npm install
```

### Docker

```bash
# Собрать образ
docker build -t saga-parser .
```

## Использование

### Локально

```bash
# Базовое использование - вывод в консоль
node src/index.js data/filename.htm

# С красивым форматированием JSON
node src/index.js data/filename.htm --pretty

# Сохранить в файл
node src/index.js data/filename.htm --output result.json

# Показать помощь
node src/index.js --help
```

### CLI команда

После установки пакета глобально:

```bash
# Установить глобально
npm install -g .

# Использовать команду saga-parser
saga-parser data/filename.htm --pretty
```

### Docker

```bash
# Запустить с помощью Docker (монтировать папку data)
docker run --rm -v $(pwd)/data:/app/data saga-parser /app/data/filename.htm --pretty

# Сохранить результат в файл
docker run --rm -v $(pwd)/data:/app/data -v $(pwd)/output:/app/output saga-parser /app/data/filename.htm -o /app/output/result.json
```

## Параметры CLI

- `<file>` - Путь к HTML файлу саги (обязательный)
- `-o, --output <file>` - Путь для сохранения JSON файла (по умолчанию: stdout)
- `-p, --pretty` - Красивое форматирование JSON
- `-h, --help` - Показать справку
- `-V, --version` - Показать версию

## Примеры

### Парсинг саги с выводом в консоль

```bash
node src/index.js data/"Сага об Инглингах.htm" --pretty
```

Результат:
```json
{
  "I": [
    "Круг Земной, где живут люди, очень изрезан заливами.",
    "Из океана, окружающего землю, в нее врезаются большие моря.",
    ...
  ],
  "II": [
    "Страна в Азии к востоку от Танаквисля называется Страной Асов.",
    ...
  ]
}
```

### Сохранение в файл

```bash
node src/index.js data/"Сага об Инглингах.htm" --output saga-parsed.json
```

## Разработка

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить тесты в режиме watch
npm run test:watch
```

### Линтинг

```bash
npm run lint
```

### Разработка в режиме watch

```bash
npm run dev
```

## Структура проекта

```
sagas-analysis/
├── src/
│   ├── index.js          # CLI интерфейс
│   └── sagaParser.js     # Основная логика парсинга
├── tests/
│   └── sagaParser.test.js # Юнит-тесты
├── data/                 # HTML файлы саг
├── package.json
├── Dockerfile
└── README.md
```

## Архитектура парсера

### SagaParser класс

- `parse(htmlContent)` - основной метод парсинга
- `cleanParagraph($paragraph)` - очистка параграфов от сносок и изображений
- `splitIntoSentences(text)` - разбиение текста на предложения
- `generateRomanNumerals()` - генерация римских цифр I-L

### Алгоритм работы

1. Загрузка HTML с помощью cheerio
2. Удаление script/style тегов и раздела "Примечания"
3. Поиск заголовков глав (h3 с римскими цифрами)
4. Извлечение контента между заголовками
5. Очистка от изображений и сносок
6. Разбиение на предложения
7. Формирование JSON объекта

## Лицензия

MIT

## Поддержка

Для вопросов и проблем создавайте issues в репозитории.