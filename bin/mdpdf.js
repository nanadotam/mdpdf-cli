#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { convert, watchAndConvert } from '../src/converter.js';

const pkg = (await import('../package.json', { with: { type: 'json' } })).default;

const BANNER = `
  ${chalk.bold('mdpdf-cli')} ${chalk.gray(`v${pkg.version}`)}
  ${chalk.gray('by')} Nana Amoako ${chalk.gray('·')} Built with Soro Cloud Code
`;

program
  .name('mdpdf')
  .description(
    'Convert Markdown files to beautiful PDFs.\n\n' +
    '  Author  : Nana Amoako\n' +
    '  Built with Soro Cloud Code\n\n' +
    '  Themes  : apple (default), notion, github, minimal\n' +
    '  Accepts : .md and .markdown files only'
  )
  .version(pkg.version, '-V, --version', 'show version')
  .argument('<files...>', '.md or .markdown files to convert')
  .option('-o, --output <path>',       'output file (single input) or output directory')
  .option('-t, --theme <name>',        'built-in theme: apple | notion | github | minimal', 'apple')
  .option('-s, --style <file>',        'custom CSS file (overrides --theme)')
  .option('-p, --paper <size>',        'paper size: A4 | Letter | Legal', 'A4')
  .option('-m, --margins <mm>',        'margins in mm — single value or top,right,bottom,left', '20')
  .option('-w, --watch',               'watch file for changes and auto-convert')
  .option('--no-open',                 'do not open the PDF in Preview after conversion')
  .option('--html',                    'output HTML instead of PDF')
  .option('--highlight <style>',       'code syntax highlight theme (github, atom-one-dark, monokai…)', 'github')
  .addHelpText('after', `
Examples:
  $ mdpdf report.md
  $ mdpdf report.md -t notion -p Letter
  $ mdpdf report.md -o ./exports/
  $ mdpdf report.md -s my-style.css --no-open
  $ mdpdf report.md -w
  $ mdpdf file1.md file2.md file3.md -o ./out/
  $ mdpdf notes.md --highlight atom-one-dark
  $ mdpdf report.txt            # ✗ rejected — not a Markdown file
  `)
  .action(async (files, opts) => {
    console.log(BANNER);

    if (opts.watch) {
      if (files.length > 1) {
        console.error(chalk.red('  --watch only supports a single file at a time.'));
        process.exit(1);
      }
      await watchAndConvert(files[0], opts);
    } else {
      let ok = 0;
      let fail = 0;
      for (const file of files) {
        const success = await convert(file, opts);
        success ? ok++ : fail++;
      }

      if (files.length > 1) {
        console.log(
          '\n' +
          chalk.green(`  ${ok} converted`) +
          (fail > 0 ? chalk.red(` · ${fail} failed`) : '') +
          '\n'
        );
      }
    }
  });

program.parse();
