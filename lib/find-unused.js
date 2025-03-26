const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Добавляем glob

const defaultConfig = {
  content: ['*.html'],
  css: ['*/*.css'],
};

const loadConfig = () => {
  const configPath = path.resolve(process.cwd(), 'purgecss.config.js');
  return fs.existsSync(configPath) ? require(configPath) : defaultConfig;
};

// Функция для преобразования glob-шаблонов в список файлов
const expandGlobPatterns = (patterns) => {
  const files = [];
  patterns.forEach(pattern => {
    // Если это glob-шаблон (содержит * или **), расширяем его
    if (pattern.includes('*')) {
      const matchedFiles = glob.sync(pattern, { nodir: true });
      files.push(...matchedFiles);
    } else {
      // Если это конкретный файл, добавляем его напрямую
      files.push(pattern);
    }
  });
  // Удаляем дубликаты
  return [...new Set(files)];
};

const extractHtmlClasses = (content) => {
  if (!content) return [];
  return (content.match(/class=["']([^"']+)["']/g) || [])
    .map(match => match.replace(/class=["']/, '').replace(/["']$/, ''))
    .flatMap(classes => classes.split(/\s+/));
};

const extractCssClasses = (content) => {
  if (!content) return { classes: [], emptyClasses: [] };
  const classMatches = content.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]*(?=[\s\n]*\{|\s*[:,\.>+\[#])/g) || [];
  const classes = classMatches.map(cls => cls.slice(1));
  const emptyClassMatches = content.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]+\s*\{\s*[\r\n\s]*\}/g) || [];
  const emptyClasses = emptyClassMatches.map(cls => cls.slice(1).replace(/\s*\{\s*[\r\n\s]*\}/g, ''));
  return { classes, emptyClasses };
};

const checkFilesExist = (files) => files.forEach(file =>
  console.log(fs.existsSync(file) ? `Файл найден: ${file}` : `Файл не найден: ${file}`)
);

const findUnused = async () => {
  const config = loadConfig();

  // Преобразуем glob-шаблоны в списки файлов
  const contentFiles = expandGlobPatterns(config.content);
  const cssFiles = expandGlobPatterns(config.css);

  console.log('Проверка файлов перед запуском:');
  checkFilesExist([...contentFiles, ...cssFiles]);

  const purger = new PurgeCSS();
  const results = await purger.purge({
    content: contentFiles,
    css: cssFiles,
    extractors: [
      { extractor: extractHtmlClasses, extensions: ['html'] },
      { extractor: content => extractCssClasses(content).classes, extensions: ['css'] },
    ],
  });

  const htmlClasses = new Set();
  const cssClasses = new Set();
  const emptyCssClassesByFile = new Map();

  // Обработка HTML-файлов
  results.forEach(result => {
    if (contentFiles.includes(result.file)) {
      extractHtmlClasses(result.content).forEach(cls => htmlClasses.add(cls));
    } else if (cssFiles.includes(result.file)) {
      const { classes } = extractCssClasses(result.css);
      classes.forEach(cls => cssClasses.add(cls));
    }
  });

  // Прямое чтение HTML, если PurgeCSS их не обработал
  if (!results.some(result => contentFiles.includes(result.file))) {
    console.warn('PurgeCSS не обработал HTML-файлы. Читаем напрямую...');
    contentFiles.forEach(file => {
      if (fs.existsSync(file)) {
        extractHtmlClasses(fs.readFileSync(file, 'utf8')).forEach(cls => htmlClasses.add(cls));
      }
    });
  }

  // Анализ всех CSS-файлов
  for (const cssFile of cssFiles) {
    if (fs.existsSync(cssFile)) {
      const rawCss = fs.readFileSync(cssFile, 'utf8');
      const { classes: rawClasses, emptyClasses } = extractCssClasses(rawCss);
      console.log(`Все классы из ${cssFile}:`, rawClasses);
      console.log(`Пустые классы из ${cssFile}:`, emptyClasses);
      emptyCssClassesByFile.set(cssFile, emptyClasses);
    } else {
      console.warn(`Файл не найден: ${cssFile}`);
    }
  }

  const unusedInCss = [...htmlClasses].filter(cls => !cssClasses.has(cls));
  console.log('Классы, найденные в HTML, но отсутствующие в CSS:', unusedInCss.length ? unusedInCss : 'Отсутствуют');

  // Формируем отчёт
  const reportLines = ['Классы, найденные в HTML, но отсутствующие в CSS:'];
  reportLines.push(unusedInCss.join('\n') || 'Отсутствуют');
  reportLines.push('');

  for (const [cssFile, emptyClasses] of emptyCssClassesByFile) {
    reportLines.push(`Пустые классы в ${cssFile}:`);
    reportLines.push(emptyClasses.length ? emptyClasses.join('\n') : 'Отсутствуют');
    reportLines.push('');
  }

  const report = reportLines.join('\n').trim();
  fs.writeFileSync('unused-classes-report.txt', report, 'utf8');
  console.log('Результат сохранён в unused-classes-report.txt');
};

module.exports = findUnused;
