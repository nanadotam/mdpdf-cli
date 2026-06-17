# mdpdf-cli

> Convert Markdown files to beautiful PDFs — locally, fast, no internet required.

**By [Nana Amoako](https://github.com/nanadotam) **

---

## What it does

`mdpdf` turns your `.md` files into polished PDFs using headless Chrome — the same rendering engine that powers Notion, Linear, and the web. What you see in your Markdown preview is what you get in the PDF.

Four built-in themes, custom CSS support, watch mode, batch conversion, and a hard guard that rejects anything that isn't a Markdown file before conversion even starts.

---

## Installation

**Requires Node.js ≥ 18**

```bash
# Clone and install
git clone https://github.com/nanadotam/mdpdf-cli.git
cd mdpdf-cli
npm install
npm link          # makes `mdpdf` available globally in your terminal
```

---

## Usage

```bash
mdpdf <file.md> [more files...] [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <path>` | Output file or directory | Same dir as source |
| `-t, --theme <name>` | Built-in theme (see below) | `apple` |
| `-s, --style <file>` | Custom CSS file (overrides `--theme`) | — |
| `-p, --paper <size>` | Paper size: `A4` · `Letter` · `Legal` | `A4` |
| `-m, --margins <mm>` | Margins in mm — one value or `top,right,bottom,left` | `20` |
| `-w, --watch` | Watch file for changes and auto-convert | off |
| `--no-open` | Don't open the PDF in Preview after conversion | auto-opens |
| `--html` | Output an HTML file instead of a PDF | off |
| `--highlight <style>` | Code syntax theme (`github`, `atom-one-dark`, `monokai`…) | `github` |
| `-V, --version` | Show version | |
| `-h, --help` | Show help | |

---

## Themes

| Name | Feel |
|------|------|
| `apple` | San Francisco (SF Pro) · Apple design language · Dark code blocks |
| `notion` | Inter · Clean Notion-like spacing · Warm neutrals |
| `github` | GitHub Markdown · Developer-friendly · Familiar |
| `minimal` | Georgia serif body · Wide margins · Client-ready |

```bash
mdpdf report.md -t notion
mdpdf report.md -t github
mdpdf report.md -t minimal
```

---

## Examples

```bash
# Convert with default Apple theme — opens PDF automatically
mdpdf report.md

# Notion look, Letter paper
mdpdf report.md -t notion -p Letter

# Save to a specific directory
mdpdf report.md -o ./exports/

# Custom CSS — bring your own style
mdpdf report.md -s ./my-brand.css

# Watch mode — auto-converts on every save
mdpdf report.md -w

# Batch conversion — multiple files at once
mdpdf file1.md file2.md file3.md -o ./out/

# Dark code blocks with atom-one-dark highlight
mdpdf report.md --highlight atom-one-dark

# Tight margins for a dense layout
mdpdf report.md -m 12

# Top/bottom 20mm, left/right 30mm
mdpdf report.md -m 20,30

# Output HTML instead (useful for debugging your CSS)
mdpdf report.md --html

# Convert without auto-opening Preview
mdpdf report.md --no-open
```

---

## File guard

`mdpdf` only accepts `.md` and `.markdown` files. Anything else is rejected immediately — before any conversion starts.

```bash
$ mdpdf notes.txt
  ✗ Not a Markdown file: notes.txt [.txt]
  → mdpdf only accepts .md or .markdown files.

$ mdpdf invoice.pdf
  ✗ Not a Markdown file: invoice.pdf [.pdf]
  → mdpdf only accepts .md or .markdown files.
```

---

## Custom CSS

Pass any CSS file with `-s` to fully control the output:

```bash
mdpdf report.md -s ./brand.css
```

Use `--html` first to preview your styles in a browser before committing to PDF:

```bash
mdpdf report.md -s ./brand.css --html --no-open
open report.html
```

---

## Output location

By default, the PDF lands **in the same directory as your Markdown file** with the same name:

```
docs/VENUE_OWNER_ANALYSIS.md  →  docs/VENUE_OWNER_ANALYSIS.pdf
```

Use `-o` to redirect:

```bash
mdpdf docs/report.md -o ./exports/          # → exports/report.pdf
mdpdf docs/report.md -o ./exports/final.pdf # → exports/final.pdf
```

---

## Highlight styles

Pass any [highlight.js](https://highlightjs.org/) theme name to `--highlight`:

```
github (default)   atom-one-dark   monokai   dracula
vs2015             night-owl       nord      gruvbox-dark
```

---

## License

MIT © [Nana Amoako](https://github.com/nanadotam)
