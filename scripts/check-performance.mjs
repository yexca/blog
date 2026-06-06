import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const budgets = JSON.parse(readFileSync(path.join(__dirname, 'performance-budgets.json'), 'utf8'));

const args = new Set(process.argv.slice(2));
const shouldWriteReport = args.has('--write-report');

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

const localDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const gzipSize = (file) => gzipSync(readFileSync(file)).length;
const toPublicPath = (file) => path.relative(rootDir, file).replaceAll(path.sep, '/');
const extOf = (file) => path.extname(file).toLowerCase();

function walk(dir) {
  const entries = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) entries.push(...walk(fullPath));
    else if (entry.isFile()) entries.push(fullPath);
  }
  return entries;
}

function largest(files, count = 20) {
  return [...files]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, count);
}

function tableRows(items) {
  if (!items.length) return '| File | Raw | Gzip |\n| --- | ---: | ---: |\n| none | - | - |';
  return [
    '| File | Raw | Gzip |',
    '| --- | ---: | ---: |',
    ...items.map((item) => `| \`${item.file}\` | ${formatBytes(item.bytes)} | ${formatBytes(item.gzip)} |`),
  ].join('\n');
}

function addWarning(warnings, code, item, limit) {
  warnings.push({
    code,
    file: item.file,
    bytes: item.bytes,
    limit,
  });
}

if (!existsSync(publicDir)) {
  console.error('public/ does not exist. Run Hugo build before checking performance.');
  process.exit(1);
}

const files = walk(publicDir).map((file) => {
  const bytes = statSync(file).size;
  return {
    abs: file,
    file: toPublicPath(file),
    bytes,
    gzip: gzipSize(file),
    ext: extOf(file),
  };
});

const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const html = files.filter((file) => file.ext === '.html');
const css = files.filter((file) => file.ext === '.css');
const js = files.filter((file) => file.ext === '.js');
const fonts = files.filter((file) => ['.woff', '.woff2', '.ttf', '.otf'].includes(file.ext));
const feeds = files.filter((file) => file.file.endsWith('/index.xml') || file.file.endsWith('/rss.xml'));
const images = files.filter((file) => ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(file.ext));
const searchIndexes = files.filter((file) => file.file.endsWith('/search/index.json'));
const homeHtml = html.filter((file) => /^public\/([^/]+\/)?index\.html$/.test(file.file));
const categoriesHtml = html.filter((file) => /\/categories\/index\.html$/.test(file.file));
const articleHtml = html.filter((file) => /\/posts\/.+\/index\.html$/.test(file.file));

const warnings = [];
for (const item of homeHtml) {
  if (item.bytes > budgets.homeHtmlBytes) addWarning(warnings, 'home-html', item, budgets.homeHtmlBytes);
}
for (const item of categoriesHtml) {
  if (item.bytes > budgets.categoriesHtmlBytes) addWarning(warnings, 'categories-html', item, budgets.categoriesHtmlBytes);
}
for (const item of articleHtml) {
  if (item.bytes > budgets.articleHtmlBytes) addWarning(warnings, 'article-html', item, budgets.articleHtmlBytes);
}
for (const item of css) {
  if (item.bytes > budgets.cssBytes) addWarning(warnings, 'css', item, budgets.cssBytes);
}
for (const item of js) {
  if (item.bytes > budgets.jsBytes) addWarning(warnings, 'js', item, budgets.jsBytes);
}
for (const item of searchIndexes) {
  if (item.bytes > budgets.searchJsonBytes) addWarning(warnings, 'search-index', item, budgets.searchJsonBytes);
}
for (const item of fonts) {
  if (/Yozai-Regular\.(ttf|woff2)$/i.test(item.file) && item.bytes > budgets.unusedFontBytes) {
    addWarning(warnings, 'unused-font', item, budgets.unusedFontBytes);
  }
}

const summary = [
  'Performance report',
  `- Total public size: ${formatBytes(totalBytes)} across ${files.length} files`,
  `- HTML: ${html.length} files, max ${formatBytes(largest(html, 1)[0]?.bytes || 0)}`,
  `- Search indexes: ${searchIndexes.length} files, max ${formatBytes(largest(searchIndexes, 1)[0]?.bytes || 0)}`,
  `- CSS: ${css.length} files, max ${formatBytes(largest(css, 1)[0]?.bytes || 0)}`,
  `- JS: ${js.length} files, max ${formatBytes(largest(js, 1)[0]?.bytes || 0)}`,
  `- Fonts: ${fonts.length} files, total ${formatBytes(fonts.reduce((sum, item) => sum + item.bytes, 0))}`,
  '',
  'Warnings',
  ...(warnings.length
    ? warnings.map((warning) => `[${warning.code}] ${warning.file} ${formatBytes(warning.bytes)} > ${formatBytes(warning.limit)}`)
    : ['none']),
].join('\n');

console.log(summary);

if (shouldWriteReport) {
  const reportDir = path.join(rootDir, 'refactor', 'reports');
  if (!existsSync(reportDir)) {
    readdirSync(path.dirname(reportDir));
    await import('node:fs').then(({ mkdirSync }) => mkdirSync(reportDir, { recursive: true }));
  }

  const date = localDate();
  const report = [
    `# Performance Baseline ${date}`,
    '',
    summary,
    '',
    '## Home HTML',
    '',
    tableRows(largest(homeHtml)),
    '',
    '## Categories HTML',
    '',
    tableRows(largest(categoriesHtml)),
    '',
    '## Largest HTML',
    '',
    tableRows(largest(html)),
    '',
    '## Search JSON',
    '',
    tableRows(largest(searchIndexes)),
    '',
    '## CSS',
    '',
    tableRows(largest(css)),
    '',
    '## JS',
    '',
    tableRows(largest(js)),
    '',
    '## Fonts',
    '',
    tableRows(largest(fonts)),
    '',
    '## Feeds',
    '',
    tableRows(largest(feeds)),
    '',
    '## Largest Images',
    '',
    tableRows(largest(images)),
    '',
  ].join('\n');

  const reportPath = path.join(reportDir, `performance-baseline-${date}.md`);
  writeFileSync(reportPath, report, 'utf8');
  console.log(`\nWrote ${toPublicPath(reportPath)}`);
}
