const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Добавляем glob

const defaultConfig = {
  content: ['*.html'],
};

const loadConfig = () => {
  const configPath = path.resolve(process.cwd(), 'purgecss.config.js');
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

const removeUnused = () => {
  const config = loadConfig();

  // Преобразуем glob-шаблоны в список файлов
  const contentFiles = expandGlobPatterns(config.content);

  const unusedClasses = fs
    .readFileSync('unused-classes-report.txt', 'utf8')
    .split('\n')
    .filter(cls => cls.trim() !== '')
    .map(cls => cls.trim());

  const removeUnusedClasses = (content) => {
    let updatedContent = content;
    unusedClasses.forEach((cls) => {
      const regex = new RegExp(`class=["'][^"']*\\b${cls}\\b[^"']*["']`, 'g');
      updatedContent = updatedContent.replace(regex, (match) => {
        const classValue = match.match(/class=["']([^"']+)["']/)[1];
        const classes = classValue.split(/\s+/).filter(c => c !== cls);
        return classes.length === 0 ? '' : `class="${classes.join(' ')}"`;
      });
    });
    return updatedContent;
  };

  contentFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`Обработка файла: ${file}`);
      const originalContent = fs.readFileSync(file, 'utf8');
      const updatedContent = removeUnusedClasses(originalContent);

      if (originalContent !== updatedContent) {
        fs.writeFileSync(file, updatedContent, 'utf8');
        console.log(`Обновлён файл: ${file}`);
      } else {
        console.log(`Изменений не требуется: ${file}`);
      }
    } else {
      console.warn(`Файл не найден: ${file}`);
    }
  });

  console.log('Удаление неиспользуемых классов завершено.');
};

module.exports = removeUnused;
