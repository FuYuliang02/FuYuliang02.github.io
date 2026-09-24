import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('manual BibTeX survives builds and missing or empty sources stop output', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const temporaryRoot = path.resolve(tmpdir());
  const fixture = await mkdtemp(path.join(temporaryRoot, 'academic-citations-'));
  try {
    for (const dir of ['scripts', 'data', 'files']) await mkdir(path.join(fixture, dir));
    await copyFile(path.join(root, 'scripts/build.mjs'), path.join(fixture, 'scripts/build.mjs'));
    const site = JSON.parse(await readFile(path.join(root, 'data/site.json'), 'utf8'));
    site.publications = [site.publications[0]];
    await writeFile(path.join(fixture, 'data/site.json'), JSON.stringify(site));
    const citationFile = path.join(fixture, `files/${site.publications[0].id}.bib`);
    const manual = '\r\n% Manually curated citation\r\n@misc{myCustomKey,\r\n  title = {{Custom Title}},\r\n  note = {Keep \\LaTeX{}, <tags>, & punctuation exactly.},\r\n  year = {2030}\r\n}\r\n';
    await writeFile(citationFile, manual);
    const run = () => spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: fixture, encoding: 'utf8', windowsHide: true });
    for (let iteration = 0; iteration < 2; iteration++) {
      const result = run();
      assert.equal(result.status, 0, result.stderr);
      assert.equal(await readFile(citationFile, 'utf8'), manual);
      const html = await readFile(path.join(fixture, 'publications/index.html'), 'utf8');
      assert(html.includes('<pre><code>' + manual.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') + '</code></pre>'));
    }
    const generatedPage = await readFile(path.join(fixture, 'publications/index.html'), 'utf8');
    await unlink(citationFile);
    let result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Cannot read citation files\/.+\.bib/);
    assert.equal(await readFile(path.join(fixture, 'publications/index.html'), 'utf8'), generatedPage);
    await writeFile(citationFile, '  \n');
    result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Citation files\/.+\.bib is empty/);
    assert.equal(await readFile(citationFile, 'utf8'), '  \n');
    assert.equal(await readFile(path.join(fixture, 'publications/index.html'), 'utf8'), generatedPage);
  } finally {
    const resolved = path.resolve(fixture);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('academic-citations-'));
    await rm(resolved, { recursive: true, force: true });
  }
});
