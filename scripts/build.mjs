import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(await readFile(path.join(root, 'data/site.json'), 'utf8'));
let cvPreview = '';
try {
  const preview = JSON.parse(await readFile(path.join(root, 'assets/cv/preview.json'), 'utf8'));
  const hash = createHash('sha256').update(await readFile(path.join(root, 'files/CV.pdf'))).digest('hex');
  if (hash === preview.sha256) {
    cvPreview = `<section class="cv-document" aria-label="CV document preview">${preview.pages.map((file, i) => `<a class="cv-page" href="/files/CV.pdf" aria-label="Open the full CV PDF, preview page ${i + 1}"><img src="/assets/cv/${file}" alt="CV page ${i + 1} of ${preview.pages.length}. Open the PDF for selectable text and full-size reading." loading="lazy" width="1391" height="1800"></a>`).join('')}</section>`;
  } else {
    console.warn('CV changed: outdated preview omitted. Run npm run render:cv to refresh the optional preview.');
  }
} catch {
  console.warn('No rendered CV preview; the direct PDF links remain available.');
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const icons = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  scholar: '<path d="m2 9 10-5 10 5-10 5-10-5Zm4 3v6c4 3 8 3 12 0v-6M22 9v8"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M11 17v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7" cy="7" r=".5"/>',
  orcid: '<circle cx="12" cy="12" r="9"/><path d="M8 10v7m4-10v10h2a5 5 0 0 0 0-10h-2Z"/><circle cx="8" cy="7" r=".5"/>',
  document: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z M14 3v5h5M8 12h8M8 16h6"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  wave: '<path d="M2 12h3l2-7 4 14 3-14 3 7h5"/>',
  ai: '<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m7 7 3 3m4 4 3 3M7 17l3-3m4-4 3-3"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.document}</svg>`;
const social = () => site.links.map(l => `<a href="${esc(l.url)}">${icon(l.icon)}${esc(l.label)}${arrow}</a>`).join('');
const nav = [['Home', '/'], ['Publications', '/publications/'], ['Experience', '/experience/'], ['CV', '/cv/']];

function layout(title, current, content, description = site.description) {
  const fullTitle = title === 'Home' ? `${site.name} · Computer Science` : `${title} · ${site.name}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#ffffff"><link rel="canonical" href="${site.url}${current}">
  <meta property="og:type" content="website"><meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${site.url}${current}">
  <meta property="og:image" content="${site.url}/assets/images/profile.png">
  <meta name="twitter:card" content="summary"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url, image: `${site.url}/assets/images/profile.png`, jobTitle: 'Ph.D. Student in Computer Science', affiliation: { '@type': 'CollegeOrUniversity', name: 'North Carolina State University' }, sameAs: site.links.filter(l => l.url.startsWith('https')).map(l => l.url) }).replace(/</g, '\\u003c')}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="header-inner">
    <a class="wordmark" href="/" aria-label="Yuliang Fu home"><span class="monogram" aria-hidden="true">yf<span>.</span></span><span>Yuliang Fu</span></a>
    <nav aria-label="Main navigation">${nav.map(([label, href]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}${label === 'CV' ? icon('document') : ''}</a>`).join('')}</nav>
  </div></header>
  <main id="main" class="container" tabindex="-1">${content}</main>
  <footer class="site-footer"><div class="footer-inner"><div><a class="footer-name" href="/">Yuliang Fu<span>.</span></a><p>Computer Science · NC State University</p></div><div class="footer-right"><a href="mailto:${site.email}">${site.email} ${arrow}</a><span>Raleigh, North Carolina</span></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Yuliang Fu</span><a href="#main">Back to top <span aria-hidden="true">↑</span></a></div></footer>
</body></html>`;
}

function bibtex(p) {
  const authors = p.authors.map(n => { const parts = n.split(' '); return `${parts.pop()}, ${parts.join(' ')}`; }).join(' and ');
  return `@${p.type === 'Journal' ? 'article' : 'inproceedings'}{${p.id.replace(/-/g, '')}${p.year},\n  title = {${p.title}},\n  author = {${authors}},\n  ${p.type === 'Journal' ? 'journal' : 'booktitle'} = {${p.venueFull}},\n  year = {${p.year}}${p.doi ? `,\n  doi = {${p.doi}}` : ''}\n}`;
}

function paper(p, compact = false) {
  return `<article class="paper${compact ? ' paper-selected' : ''}" id="${p.id}"${compact ? '' : ` data-paper data-year="${p.year}" data-type="${p.type}" data-search="${esc([p.title, ...p.authors, p.venue, ...p.tags].join(' ').toLowerCase())}"`}>
    <a class="paper-image" href="${compact ? `/publications/#${p.id}` : esc(p.links[0].url)}" aria-label="${esc(p.name)}: ${compact ? 'publication details' : 'read paper'}"><img src="${p.image}" alt="${esc(p.alt)}" width="640" height="350" loading="lazy"><span class="image-arrow" aria-hidden="true">↗</span></a>
    <div class="paper-body"><div class="paper-meta"><span>${esc(p.venue)}</span><span class="paper-kind">${p.type}</span></div>
    <h3><a href="${compact ? `/publications/#${p.id}` : esc(p.links[0].url)}">${esc(p.title)}</a></h3>
    <p class="authors">${p.authors.map(a => a === site.name ? `<strong class="self-author">${esc(a)}</strong>` : esc(a)).join(', ')}</p>
    <p class="paper-summary">${esc(p.summary)}</p>
    <div class="paper-links">${p.links.map(l => `<a href="${esc(l.url)}">${icon('document')}${esc(l.label)} ${arrow}</a>`).join('')}${compact ? `<a href="/publications/#${p.id}">Details <span aria-hidden="true">→</span></a>` : `<a href="/files/${p.id}.bib" download>BibTeX <span aria-hidden="true">↓</span></a>`}</div>
    ${compact ? '' : `<details class="citation"><summary>View citation</summary><div class="citation-content"><pre>${esc(bibtex(p))}</pre><button type="button" class="copy-citation" hidden>Copy BibTeX</button><span class="copy-status" role="status"></span></div></details>`}</div></article>`;
}

const home = `
<section class="hero" aria-labelledby="intro-title">
  <aside class="profile-card" aria-label="Profile and contact links"><div class="portrait-wrap"><img class="portrait" src="/assets/images/profile.png" alt="Portrait of Yuliang Fu" width="400" height="400" fetchpriority="high"></div><div class="profile-info"><p class="location">${icon('pin')}Raleigh, NC</p><div class="social-links">${social()}</div></div></aside>
  <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>Ph.D. Student · NC State University</p>
    <h1 id="intro-title">Yuliang Fu<span class="title-dot">.</span></h1>
    <p class="affiliation">I’m a Computer Science Ph.D. student in the <a href="https://chenhanxu.github.io/lab/">SSCS Lab</a> at <a href="https://www.ncsu.edu/">North Carolina State University</a>, advised by <a href="https://chenhanxu.github.io/">Dr. Chenhan Xu</a>.</p>
    <p class="intro">My research interests span artificial intelligence, sensing, and computing for health. I’m interested in learning from data and building useful intelligent systems.</p>
    <p class="affiliation">Previously, I earned dual bachelor’s degrees in Mathematics and Physics, and Electrical Engineering and Automation at Tsinghua University. I also worked with Tsinghua’s Pervasive HCI Group and Cornell’s SciFi Lab.</p>
    <div class="hero-actions"><a class="button primary" href="/publications/">Publications <span aria-hidden="true">→</span></a><a class="button secondary" href="/files/CV.pdf">${icon('document')}View CV ${arrow}</a></div>
  </div>
</section>
<section class="research-section" aria-labelledby="research-title"><div class="section-heading"><h2 id="research-title">Research interests</h2></div>
  <div class="research-grid"><div class="research-item"><span class="research-icon">${icon('ai')}</span><h3>Artificial intelligence</h3><p>Learning from data to understand the world and support useful applications.</p></div><div class="research-item"><span class="research-icon peach">${icon('wave')}</span><h3>Sensing & computing</h3><p>Understanding people and their surroundings through data.</p></div><div class="research-item"><span class="research-icon terracotta">${icon('heart')}</span><h3>Computing for health</h3><p>Exploring technology that supports health and well-being.</p></div></div>
</section>
<section class="news-section" id="news" aria-labelledby="news-title"><div class="section-heading"><h2 id="news-title">News</h2></div>
  <div class="filter-chips news-filters" role="group" aria-label="Filter news by category" hidden>${['All', ...new Set(site.news.map(n => n.category))].map((c, i) => `<button type="button" data-news-filter="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div>
  <div class="news-list">${site.news.map(n => `<article class="news-item" data-category="${n.category}"><time datetime="${n.date}">${n.displayDate}</time><span class="tag tag-${n.category.toLowerCase()}">${n.category}</span><p>${esc(n.text)}${n.link ? ` <a class="news-arrow" href="${n.link}" aria-label="Read publication details">↗</a>` : ''}</p></article>`).join('')}</div><p class="sr-only" id="news-status" role="status"></p>
</section>
<section class="selected-section" aria-labelledby="selected-title"><div class="section-heading"><h2 id="selected-title">Selected publications</h2><a class="text-link" href="/publications/">All publications <span aria-hidden="true">→</span></a></div><div class="selected-grid">${site.publications.filter(p => p.selected).map(p => paper(p, true)).join('')}</div></section>
`;

const years = [...new Set(site.publications.map(p => p.year))].sort((a, b) => b - a);
const pubs = `<header class="page-intro"><h1>Publications</h1><p>A collection of my published work.</p><a class="text-link" href="${esc(site.links[0].url)}">Google Scholar ${arrow}</a></header>
<section aria-labelledby="publications-title"><div class="section-heading"><h2 id="publications-title">All publications</h2></div>
<div class="publication-controls" hidden><label class="search-field">${icon('search')}<span class="sr-only">Search publications</span><input type="search" id="paper-search" placeholder="Search title, author, or topic…"></label><label class="year-filter"><span class="sr-only">Filter by year</span><select id="paper-year"><option value="all">All years</option>${years.map(y => `<option value="${y}">${y}</option>`).join('')}</select></label><div class="filter-chips" role="group" aria-label="Filter publications by type">${['All', 'Journal', 'Conference'].map((t, i) => `<button type="button" data-type-filter="${t}" aria-pressed="${i === 0}">${t === 'All' ? 'All work' : t + 's'}</button>`).join('')}</div></div>
<p class="result-count" id="paper-count" role="status">${site.publications.length} publications</p>
${years.map(y => `<section class="publication-year" data-year-group="${y}" aria-labelledby="year-${y}"><h2 class="year-heading" id="year-${y}">${y}<span>${String(site.publications.filter(p => p.year === y).length).padStart(2, '0')}</span></h2><div>${site.publications.filter(p => p.year === y).map(p => paper(p)).join('')}</div></section>`).join('')}
<div class="empty-state" id="no-results" hidden><h3>No matching publications</h3><p>Try a different keyword or clear the filters.</p><button class="button secondary" type="button" id="reset-filters">Clear filters</button></div>
</section>`;

const education = () => site.education.map(e => `<article class="education-item"><p class="eyebrow">${esc(e.date)}</p><h3>${esc(e.degree)}</h3><p>${esc(e.school)}</p></article>`).join('');
const awards = () => site.awards.map(a => `<li><span class="award-year">${a.year}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.organization)}</p></div></li>`).join('');
const experience = `<header class="page-intro"><h1>Experience</h1><p>Research, education, and academic service.</p><a class="text-link" href="/files/CV.pdf">View full CV ${arrow}</a></header>
<section class="experience-section" aria-labelledby="experience-title"><div class="section-heading"><h2 id="experience-title">Research & experience<span class="small-dot">.</span></h2></div><div class="timeline">${site.experience.map(e => `<article class="timeline-item"><div class="timeline-date">${esc(e.period)}<span>${esc(e.location)}</span></div><div class="timeline-content"><p class="eyebrow">${esc(e.role)}</p><h3>${esc(e.place)}</h3><p class="group-name">${e.url ? `<a href="${esc(e.url)}">${esc(e.group)} ${arrow}</a>` : esc(e.group)}</p>${e.advisor ? `<p class="advisor">Advised by <a href="${esc(e.advisorUrl)}">Dr. ${esc(e.advisor)}</a></p>` : ''}<p>${esc(e.description)}</p></div></article>`).join('')}</div></section>
<section class="education-section" aria-labelledby="education-title"><div class="section-heading"><h2 id="education-title">Education<span class="small-dot">.</span></h2></div><div class="education-grid">${education()}</div></section>
<section class="service-awards"><div><p class="eyebrow">Recognition</p><h2>Honors & awards</h2><ul class="awards-list">${awards()}</ul></div><div><p class="eyebrow">Academic community</p><h2>Service</h2><div class="service-block"><h3>Technical Program Committee</h3><p>IEEE-EMBS Body Sensor Networks (BSN)<br><span class="muted">2025, 2026</span></p></div><div class="service-block"><h3>Reviewer</h3><ul><li>ACM IMWUT / UbiComp</li><li>IEEE Journal of Biomedical and Health Informatics (JBHI)</li><li>IEEE EMBC <span class="muted">· 2025</span></li><li>IEEE BSN <span class="muted">· 2025, 2026</span></li></ul></div></div></section>`;

const cv = `<header class="page-intro cv-intro"><div><h1>Curriculum vitae</h1><p>Education, publications, research experience, and academic service.</p></div><a class="button primary" href="/files/CV.pdf" download="Yuliang_Fu_CV.pdf">${icon('document')}Download CV <span aria-hidden="true">↓</span></a></header>
<section class="cv-overview" aria-labelledby="cv-title"><div class="section-heading"><h2 id="cv-title">Yuliang Fu</h2><a class="text-link" href="/files/CV.pdf">Open PDF ${arrow}</a></div><p>Ph.D. Student in Computer Science · North Carolina State University</p><div class="cv-quick-links"><a href="mailto:${site.email}">${site.email}</a><a href="/publications/">Publications →</a><a href="/experience/">Experience & service →</a></div><div class="education-grid">${education()}</div></section>
${cvPreview}`;

const pages = [['index.html', 'Home', '/', home], ['publications/index.html', 'Publications', '/publications/', pubs], ['experience/index.html', 'Experience', '/experience/', experience], ['cv/index.html', 'CV', '/cv/', cv], ['404.html', 'Page not found', '/404.html', '<section class="page-intro error-page"><p class="eyebrow">404 · Page not found</p><h1>A small detour.</h1><p>This page may have moved. You can find my research and background below.</p><a class="button primary" href="/">Back to home →</a><a class="button secondary" href="/publications/">Publications</a></section>']];
for (const [file, title, url, content] of pages) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), layout(title, url, content));
}
// Preserve useful old inbound routes after replacing the Jekyll template.
for (const [file, destination] of [['about/index.html', '/'], ['about.html', '/'], ['resume/index.html', '/cv/']]) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page moved · Yuliang Fu</title><meta http-equiv="refresh" content="0;url=${destination}"><link rel="canonical" href="${site.url}${destination}"></head><body><p>This page has moved. <a href="${destination}">Continue to the new page.</a></p></body></html>`);
}
await mkdir(path.join(root, 'files'), { recursive: true });
for (const p of site.publications) await writeFile(path.join(root, `files/${p.id}.bib`), bibtex(p) + '\n');
await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p => p[0] !== '404.html').map(p => `<url><loc>${site.url}${p[2]}</loc></url>`).join('')}</urlset>\n`);
await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages, 3 redirects, and ${site.publications.length} citations.`);

