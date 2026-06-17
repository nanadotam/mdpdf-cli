import { mdToPdf } from 'md-to-pdf';
import chokidar from 'chokidar';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.join(__dirname, '..', 'themes');
const VALID_EXTENSIONS = new Set(['.md', '.markdown']);

// ── File validation ──────────────────────────────────────────────────────────

export function validateFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (!VALID_EXTENSIONS.has(ext)) {
    const given = ext || '(no extension)';
    console.error(
      chalk.red('  ✗ Not a Markdown file: ') +
      chalk.bold(path.basename(filePath)) +
      chalk.gray(` [${given}]`)
    );
    console.error(
      chalk.yellow('  → mdpdf only accepts .md or .markdown files.')
    );
    return false;
  }

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(chalk.red('  ✗ File not found: ') + chalk.bold(abs));
    return false;
  }

  return true;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveStylesheet(opts) {
  if (opts.style) {
    const abs = path.resolve(opts.style);
    if (!fs.existsSync(abs)) {
      console.error(chalk.red(`  ✗ Custom stylesheet not found: ${abs}`));
      process.exit(1);
    }
    return abs;
  }

  const builtIn = path.join(THEMES_DIR, `${opts.theme}.css`);
  if (!fs.existsSync(builtIn)) {
    console.warn(chalk.yellow(`  ⚠ Theme "${opts.theme}" not found — falling back to apple.`));
    return path.join(THEMES_DIR, 'apple.css');
  }
  return builtIn;
}

function resolveOutput(inputFile, opts) {
  const inputAbs = path.resolve(inputFile);
  const ext = opts.html ? '.html' : '.pdf';
  const baseName = path.basename(inputAbs, path.extname(inputAbs)) + ext;

  if (opts.output) {
    const out = path.resolve(opts.output);
    if (fs.existsSync(out) && fs.statSync(out).isDirectory()) {
      return path.join(out, baseName);
    }
    if (!path.extname(out)) {
      fs.mkdirSync(out, { recursive: true });
      return path.join(out, baseName);
    }
    return out;
  }

  return path.join(path.dirname(inputAbs), baseName);
}

function parseMargins(m) {
  const parts = m.split(',').map(s => s.trim() + 'mm');
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  }
  const [top, right = top, bottom = top, left = right] = parts;
  return { top, right, bottom, left };
}

function formatSize(bytes) {
  return bytes > 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    : Math.round(bytes / 1024) + ' KB';
}

// ── Core conversion ──────────────────────────────────────────────────────────

export async function convert(inputFile, opts) {
  if (!validateFile(inputFile)) return false;

  const inputAbs = path.resolve(inputFile);
  const outputPath = resolveOutput(inputFile, opts);
  const stylesheet = resolveStylesheet(opts);

  console.log(
    chalk.cyan('  mdpdf') +
    chalk.gray(' converting ') +
    chalk.bold(path.basename(inputAbs)) +
    chalk.gray(' …')
  );

  try {
    await mdToPdf(
      { path: inputAbs },
      {
        dest: outputPath,
        stylesheet: [stylesheet],
        highlight_style: opts.highlight,
        pdf_options: {
          format: opts.paper,
          margin: parseMargins(opts.margins),
          printBackground: true,
        },
        as_html: opts.html ?? false,
      }
    );

    const size = formatSize(fs.statSync(outputPath).size);
    const label = opts.html ? 'HTML' : 'PDF';
    console.log(
      chalk.green('  ✓ ') +
      chalk.bold(path.basename(outputPath)) +
      chalk.gray(` (${size}) saved to `) +
      chalk.underline(path.dirname(outputPath))
    );

    if (opts.open !== false && !opts.html && process.platform === 'darwin') {
      execSync(`open "${outputPath}"`);
    }

    return true;
  } catch (err) {
    console.error(
      chalk.red('  ✗ Failed: ') + err.message
    );
    return false;
  }
}

// ── Watch mode ───────────────────────────────────────────────────────────────

export async function watchAndConvert(inputFile, opts) {
  if (!validateFile(inputFile)) return;

  console.log(
    chalk.blue('  Watching') +
    ` ${chalk.bold(path.basename(inputFile))} for changes…` +
    chalk.gray(' (Ctrl+C to stop)\n')
  );

  await convert(inputFile, opts);

  chokidar.watch(path.resolve(inputFile)).on('change', async () => {
    console.log(
      chalk.gray(`\n  [${new Date().toLocaleTimeString()}] Change detected`)
    );
    await convert(inputFile, opts);
  });
}
