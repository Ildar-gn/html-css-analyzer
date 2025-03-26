# HTML-CSS Analyzer

A tool to analyze and clean HTML/CSS classes in your project. Detects unused classes in HTML not present in CSS selectors and empty classes in CSS.

## Installation

Install `locally` or `globally` via npm (includes all required dependencies):

```bash
npm install html-css-analyzer -D
# or
npm install -g html-css-analyzer
```

## Usage
Run commands via CLI:
```bash
html-css-analyzer find-unused
html-css-analyzer remove-empty
html-css-analyzer remove-unused
```
Or in a project with local install, add to `package.json`:
```json
{
  "scripts": {
    "find-unused": "html-css-analyzer find-unused",
    "remove-empty": "html-css-analyzer remove-empty",
    "remove-unused": "html-css-analyzer remove-unused"
  }
}
```
```bash
npm run find-unused
npm run remove-empty
npm run remove-unused
```

## Configuration
By default, the paths `*.html` and `*/*.css` will be used.

However, you can customize the paths to HTML and CSS files by creating a `purgecss.config.js` file in your project root. Both specific file names and glob patterns are supported:

- Specific file names:
	- Specify exact files to limit the analysis.

- Glob patterns:
	- `*.html` — all HTML files in the root directory.
	- `*/*.css` — all CSS files in first-level subdirectories.
	- `**/*.html` — all HTML files in the project, including subdirectories.
	- `**/*.css` — all CSS files in the project, including subdirectories.

### Configuration Examples
##### 1. Specific file names:
```javascript
module.exports = {
  content: ['index.html', 'about.html', 'contact.html'],
  css: ['styles/main.css', 'styles/extra.css']
};
```
- Analyzes only the specified HTML files (`'index.html'`, `'about.html'`, `'contact.html'`) and CSS files (`'styles/main.css'`, `'styles/extra.css'`).

##### 2. Universal patterns:
```javascript
module.exports = {
  content: ['*.html'],
  css: ['*/*.css']
};
```
- Analyzes all HTML files in the root (e.g., `'index.html'`, `'about.html'`) and all CSS files in first-level subdirectories (e.g., `'styles/main.css'`, `'dist/output.css'`).

##### 3. Combination of patterns and names:
```javascript
module.exports = {
  content: ['index.html', '*.html', '!test.html'],
  css: ['styles/main.css', '**/*.css', '!styles/temp.css']
};
```
- Analyzes `'index.html'`, all HTML files in the root except `'!test.html'`, and `'styles/main.css'` plus all CSS files in the project except `'!styles/temp.css'`.
- Use `!` to exclude specific files.


## Commands
1. `find-unused`
Finds classes in HTML not present in CSS selectors and empty classes across all specified CSS files. Saves report to `unused-classes-report.txt`.

2. `remove-empty`
Removes empty classes from all CSS files specified in the config. Creates a `.bak` backup for each file.

3. `remove-unused`
Removes unused classes from HTML based on `unused-classes-report.txt`.


## Example "Before and After"
#### Before:
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
# Run commands via CLI:
html-css-analyzer find-unused
html-css-analyzer remove-empty
html-css-analyzer remove-unused

# Run commands via npm:
npm run find-unused
npm run remove-empty
npm run remove-unused
```
#### After:
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
