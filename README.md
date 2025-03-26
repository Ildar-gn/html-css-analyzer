# HTML-CSS Analyzer

Инструмент для анализа и очистки классов в HTML и CSS. Обнаруживает неиспользуемые классы в HTML, которых нет в селекторах CSS, и пустые классы в CSS.

## Установка

Установите `локально` или `глобально` через npm (все необходимые зависимости включены):

```bash
npm install html-css-analyzer -D
# или
npm install -g html-css-analyzer
```

## Конфигурация
По умолчанию будут использоваться пути `*.html` и `*/*.css`.

Но можно настроить пути к HTML и CSS файлам в `purgecss.config.js`, создав его в корне проекта. Поддерживаются как точные имена файлов, так и glob-шаблоны:

- Точные имена файлов:
    - Укажите конкретные файлы, если хотите ограничить анализ.
- Glob-шаблоны:
    - `*.html` — все HTML-файлы в корне.
    - `*/*.css` — все CSS-файлы в подпапках первого уровня.
    - `**/*.html` — все HTML-файлы в проекте, включая подпапки.
    - `**/*.css` — все CSS-файлы в проекте, включая подпапки.

### Примеры конфигурации в `purgecss.config.js`
Для этого нужно создать в корне проекта файл `purgecss.config.js`
##### 1. Конкретные имена файлов:
```javascript
module.exports = {
  content: ['index.html', 'about.html', 'contact.html'],
  css: ['styles/main.css', 'styles/extra.css']
};
```
- Анализируются только указанные HTML-файлы (`'index.html'`, `'about.html'`, `'contact.html'`) и CSS-файлы (`'styles/main.css'`, `'styles/extra.css'`).

##### 2. Универсальные шаблоны:
```javascript
module.exports = {
  content: ['*.html'],
  css: ['*/*.css']
};
```
- Анализируются все HTML-файлы в корне (например, `'index.html'`, `'about.html'`) и все CSS-файлы в подпапках первого уровня (например, `'styles/main.css'`, `'dist/output.css'`).

##### 3. Комбинация шаблонов и имён:
```javascript
module.exports = {
  content: ['index.html', '*.html', '!test.html'],
  css: ['styles/main.css', '**/*.css', '!styles/temp.css']
};
```
- Анализируются `'index.html'`, все HTML-файлы в корне `'*.html'`, кроме `'!test.html'`, и `'styles/main.css'` плюс все CSS-файлы в проекте `'**/*.css'`, кроме `'!styles/temp.css'`.
- Для исключения файлов используйте `!`.

## Использование
Добавьте в package.json вашего проекта для запуска команд:
```json
{
  "scripts": {
    "find-unused": "html-css-analyzer find-unused",
    "remove-empty": "html-css-analyzer remove-empty",
    "remove-unused": "html-css-analyzer remove-unused"
  }
}
```

## Команды
```bash
# Запуск команд, если установлены в package.json:
npm run find-unused
npm run remove-empty
npm run remove-unused

# Запуск команд через CLI (Опционально):
html-css-analyzer find-unused
html-css-analyzer remove-empty
html-css-analyzer remove-unused
```
1. `find-unused`
Находит классы в HTML, отсутствующие в селекторах CSS, и пустые классы во всех указанных CSS-файлах. Сохраняет отчёт в `unused-classes-report.txt`.

2. `remove-empty`
Удаляет пустые классы из всех CSS-файлов, указанных в конфигурации. Создаёт резервную копию `.bak` для каждого файла.

3. `remove-unused`
Удаляет неиспользуемые классы из HTML на основе отчёта `unused-classes-report.txt`.


## Пример «До и После»
#### До:
##### 1. index.html:
```html
<div class="button unused-class">Test</div>
```

##### 2. styles/main.css:
```css
.button {
  color: red;
}

.empty-class {

}
```
##### 3. styles/extra.css:
```css
.extra {
  font-size: 16px;
}

.empty-extra {

}
```
##### 4. Run:
```bash
# Запуск команд через CLI:
html-css-analyzer find-unused
html-css-analyzer remove-empty
html-css-analyzer remove-unused

# Запуск команд через npm если установлены в package.json:
npm run find-unused
npm run remove-empty
npm run remove-unused
```
#### После:
##### 1. index.html:
```html
<div class="button">Test</div>
```

##### 2. styles/main.css:
```css
.button {
  color: red;
}
```
##### 3. styles/extra.css:
```css
.extra {
  font-size: 16px;
}
```

