// Content is rendered at build time; JavaScript only enhances filtering and copying.
const newsButtons = [...document.querySelectorAll('[data-news-filter]')];
if (newsButtons.length) {
  document.querySelector('.news-filters').hidden = false;
  newsButtons.forEach(button => button.addEventListener('click', () => {
    newsButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let count = 0;
    document.querySelectorAll('[data-category]').forEach(item => {
      item.hidden = button.dataset.newsFilter !== 'All' && item.dataset.category !== button.dataset.newsFilter;
      if (!item.hidden) count++;
    });
    document.querySelector('#news-status').textContent = `${count} ${count === 1 ? 'update' : 'updates'} shown`;
  }));
}

const search = document.querySelector('#paper-search');
if (search) {
  document.querySelector('.publication-controls').hidden = false;
  const year = document.querySelector('#paper-year');
  const types = [...document.querySelectorAll('[data-type-filter]')];
  const papers = [...document.querySelectorAll('[data-paper]')];
  let selectedType = 'All';
  function filter() {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    papers.forEach(paper => {
      paper.hidden = !terms.every(term => paper.dataset.search.includes(term)) ||
        (year.value !== 'all' && paper.dataset.year !== year.value) ||
        (selectedType !== 'All' && paper.dataset.type !== selectedType);
      if (!paper.hidden) count++;
    });
    document.querySelectorAll('[data-year-group]').forEach(group => {
      const visible = [...group.querySelectorAll('[data-paper]')].filter(p => !p.hidden).length;
      group.hidden = visible === 0;
      group.querySelector('.year-heading span').textContent = String(visible).padStart(2, '0');
    });
    document.querySelector('#paper-count').textContent = `${count} ${count === 1 ? 'publication' : 'publications'}`;
    document.querySelector('#no-results').hidden = count !== 0;
  }
  search.addEventListener('input', filter);
  year.addEventListener('change', filter);
  types.forEach(button => button.addEventListener('click', () => {
    selectedType = button.dataset.typeFilter;
    types.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filter();
  }));
  document.querySelector('#reset-filters').addEventListener('click', () => {
    search.value = '';
    year.value = 'all';
    selectedType = 'All';
    types.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.typeFilter === 'All')));
    filter();
    search.focus();
  });
}

document.querySelectorAll('.copy-citation').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const status = button.nextElementSibling;
    const text = button.parentElement.querySelector('pre').textContent;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied to clipboard.';
    } catch {
      status.textContent = 'Select the citation text to copy it, or use the BibTeX download link.';
    }
  });
});
