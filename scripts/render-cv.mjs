// Optional: Poppler's pdftoppm is required only when refreshing the visual CV preview.
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const previewDir = path.join(root, 'assets/cv');
await mkdir(previewDir, { recursive: true });
const executable = process.env.PDFTOPPM || 'pdftoppm';
const probe = spawnSync(executable, ['-v'], { encoding: 'utf8', windowsHide: true });
if (probe.error || probe.status !== 0) {
  throw new Error('Install Poppler or set PDFTOPPM to its pdftoppm executable to generate the optional CV preview.');
}
for (const name of await readdir(previewDir)) {
  if (/^page-\d+\.jpg$/.test(name)) await unlink(path.join(previewDir, name));
}
const result = spawnSync(executable, ['-jpeg', '-jpegopt', 'quality=88', '-scale-to', '1800', path.join(root, 'files/CV.pdf'), path.join(previewDir, 'page')], { encoding: 'utf8', windowsHide: true });
if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr);
const pages = (await readdir(previewDir)).filter(p => /^page-\d+\.jpg$/.test(p)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!pages.length) throw new Error('No CV preview pages were generated.');
const sha256 = createHash('sha256').update(await readFile(path.join(root, 'files/CV.pdf'))).digest('hex');
await writeFile(path.join(previewDir, 'preview.json'), JSON.stringify({ sha256, pages }, null, 2) + '\n');
console.log(`Rendered ${pages.length} CV preview pages. Run npm run build to include them in the site.`);
