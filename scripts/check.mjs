import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(await readFile(path.join(root, 'data/site.json'), 'utf8'));
const pages = ['index.html', 'publications/index.html', 'experience/index.html', 'cv/index.html', '404.html', 'about/index.html', 'about.html', 'resume/index.html'];
let links = 0;
for (const file of pages) {
  const html = await readFile(path.join(root, file), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  assert(!html.includes('{{') && !html.includes('{%'), `${file}: unprocessed template`);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>.+<\/title>/);
  for (const match of html.matchAll(/(?:href|src|data)="(\/[^"#]*)(?:#([^"]+))?"/g)) {
    const [, href, fragment] = match;
    let target = path.join(root, href);
    await access(target);
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await access(target);
    if (fragment) {
      const targetHtml = await readFile(target, 'utf8');
      assert(targetHtml.includes(`id="${fragment}"`), `${file}: broken anchor ${href}#${fragment}`);
    }
    links++;
  }
}
const publications = await readFile(path.join(root, 'publications/index.html'), 'utf8');
assert.equal((publications.match(/ data-paper /g) || []).length, site.publications.length);
assert.equal((publications.match(/<strong class="self-author">Yuliang Fu<\/strong>/g) || []).length, site.publications.length);
for (const paper of site.publications) {
  assert(paper.authors.includes(site.name), `Missing author in ${paper.id}`);
  await access(path.join(root, paper.image));
  const citation = await readFile(path.join(root, `files/${paper.id}.bib`), 'utf8');
  assert(citation.includes(paper.title), `Wrong citation for ${paper.id}`);
}
assert((await readFile(path.join(root, 'files/CV.pdf'))).subarray(0, 5).toString() === '%PDF-');
await access(path.join(root, '.nojekyll'));
console.log(`Passed: ${pages.length} pages, ${links} internal references, ${site.publications.length} publications and citations, author highlighting, and CV.`);
