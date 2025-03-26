const fs = require('fs');
const glob = require('glob'); // Добавляем glob

const defaultConfig = {
  css: ['*/*.css'],
};

const loadConfig = () => {
  const configPath = require('path').resolve(process.cwd(), 'purgecss.config.js');
  return fs.existsSync(configPath) ? require(configPath) : defaultConfig;
};

// Функция для преобразования glob-шаблонов в список файлов
const expandGlobPatterns = (patterns) => {
  const files = [];
  patterns.forEach(pattern => {
    if (pattern.includes('*')) {
      const matchedFiles = glob.sync(pattern, { nodir: true });
      files.push(...matchedFiles);
    } else {
      files.push(pattern);
    }
  });
  return [...new Set(files)];
};

const extractEmptyClasses = (content) => {
  if (!content) return { emptyClasses: [], emptyClassMatches: [] };
  const emptyClassMatches = content.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]+\s*\{\s*[\r\n\s]*\}/g) || [];
  const emptyClasses = emptyClassMatches.map(cls => cls.slice(1).replace(/\s*\{\s*[\r\n\s]*\}/g, ''));
  return { emptyClasses, emptyClassMatches };
};

const removeEmpty = () => {
  const config = loadConfig();

  // Преобразуем glob-шаблоны в список файлов
  const cssFiles = expandGlobPatterns(config.css);

  for (const cssFile of cssFiles) {
    if (!fs.existsSync(cssFile)) {
      console.error(`Файл ${cssFile} не найден!`);
      continue;
    }

    let rawCss = fs.readFileSync(cssFile, 'utf8');
    const { emptyClasses, emptyClassMatches } = extractEmptyClasses(rawCss);

    if (emptyClasses.length === 0) {
      console.log(`Пустых классов в ${cssFile} не найдено.`);
      continue;
    }

    console.log(`Найдены пустые классы в ${cssFile}:`, emptyClasses);
    console.log(`Удаление пустых классов из ${cssFile}...`);

    fs.writeFileSync(`${cssFile}.bak`, rawCss, 'utf8');
    console.log(`Создана резервная копия: ${cssFile}.bak`);

    let updatedCss = rawCss;
    emptyClassMatches.forEach(match => {
      const pattern = new RegExp(`\\s*${match.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')}\\s*`, 'g');
      updatedCss = updatedCss.replace(pattern, '');
    });

    updatedCss = updatedCss
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '');

    fs.writeFileSync(cssFile, updatedCss, 'utf8');
    console.log(`Пустые классы успешно удалены из ${cssFile}`);
  }
};

module.exports = removeEmpty;
