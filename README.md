# Yuliang Fu — academic website

A responsive personal website for research interests in artificial intelligence, sensing, and computing for health. Built with plain HTML, CSS, and a little JavaScript; no runtime framework, third-party fonts, or npm dependencies.

## Local preview

Use Node.js 20 or newer:

```sh
npm run dev
```

Open http://127.0.0.1:4173. The preview server binds only to your computer. Stop it with Ctrl+C. After editing content or the generator, run `npm run build` and refresh; CSS and browser JavaScript edits need only a refresh. To use another port, set the `PORT` environment variable.

## Updating content

### File map

All paths below are relative to this repository (`FuYuliang02.github.io`). Edit the source files, then rebuild; the HTML pages are generated.

| Information to update | Source file | Where to edit |
| --- | --- | --- |
| Top biography, background, advisor, and research interests | `scripts/build.mjs` | The `const home` section: the `affiliation` / `intro` paragraphs and the `research-grid`. |
| Publications: titles, authors, venues, years, paper links, summaries | `data/site.json` | The `publications` array. `selected: true` features a paper on the homepage. Author order follows the array. |
| Citation text (display, copy, and download) | `files/<publication-id>.bib` | Edit the BibTeX file directly, then rebuild. The build only reads these files and never creates or overwrites them. |
| Publication thumbnails | `assets/papers/` and `data/site.json` | Add the image, then set that publication's `image` path and `alt` description. |
| Homepage news, dates, categories, and links | `data/site.json` | The `news` array, in the desired display order. `category` supplies the filter/tag; category colors live in `assets/site.css` under `.tag-*`. |
| LinkedIn, Google Scholar, ORCID, and profile email link | `data/site.json` | The `links` array. Keep Google Scholar first: the publications page currently uses `links[0]`. |
| Email shown in the footer and CV page | `data/site.json` | The top-level `email` field. When changing email, also update the Email entry in `links`. |
| Research and industry positions | `data/site.json` | The `experience` array, including dates, organization, role, advisor, and description. |
| Education and awards | `data/site.json` | The `education` and `awards` arrays. Education is reused on both Experience and CV pages. |
| Reviewing and program committee service | `scripts/build.mjs` | The `const experience` section, under `Service`, `Technical Program Committee`, and `Reviewer`. |
| Portrait | `assets/images/profile.png` | Replace the image at this path. |
| Downloadable CV | `files/CV.pdf` and `files/CV_YuliangFu.pdf` | Replace both copies; the second preserves an older shared URL. Refresh the optional preview as described below. |
| CV preview images | `scripts/render-cv.mjs` → `assets/cv/` | Run `npm run render:cv`; do not hand-edit the generated images or `preview.json`. |
| Colors, fonts, spacing, layout, mobile styling | `assets/site.css` | Palette/font variables at the top; component rules below; responsive rules in the `@media` sections. |
| Browser-tab icon | `assets/favicon.svg` | Edit this SVG. The header monogram is separately defined in `scripts/build.mjs` and styled in `assets/site.css`. |
| Navigation, page headings, footer, and page structure | `scripts/build.mjs` | `nav`, `layout()`, and the `home`, `pubs`, `experience`, and `cv` templates. |
| Search, filters, and citation-copy behavior | `assets/site.js` | Browser interaction handlers. |
| Site name, domain, search/social description | `data/site.json` | Top-level `name`, `url`, and `description`. Visible name, university, role, and location also appear in `scripts/build.mjs`, including its structured metadata. |

The sibling `../resources/` folder supplied the original materials. The website uses the copies inside this repository; changing `resources/` alone does not update the site.

### Update workflow

- **Publications, news, links, education, experience, awards:** edit `data/site.json`.
- **Page structure and biography:** edit `scripts/build.mjs`.
- **Appearance:** edit `assets/site.css`. The palette and typography are defined at the top.
- **Interactions:** edit `assets/site.js`.
- **Thumbnails:** place images in `assets/papers/`, then set each publication’s `image` and descriptive `alt` text in the data file. Thumbnails use `object-fit: contain` to preserve the complete figure.
- **Portrait:** replace `assets/images/profile.png`.
- **CV:** replace `files/CV.pdf`. Also update `files/CV_YuliangFu.pdf` to keep old shared links current. To refresh the optional image preview, run `npm run render:cv` before building (requires Poppler's `pdftoppm` on PATH, or the `PDFTOPPM` environment variable set to its executable). The build checks the PDF's hash and omits stale previews, keeping the direct download links available. Normal builds use the committed preview images and do not require Poppler.

Then run:

```sh
npm run build
npm run check
```

Commit the content and generated files together. Generated files include `index.html`, the page directories, `404.html`, the compatibility redirects, `sitemap.xml`, `robots.txt`. Do not edit those HTML files directly; a build replaces them.

A publication needs a unique `id`, year, type (`Journal`, `Conference`, or `Preprint`), title, ordered author list, venue, thumbnail, summary, and working paper link. Mark `selected: true` to feature it on the homepage. For every publication, manually create `files/<id>.bib` (for example, `files/actreal.bib`). Its contents are the sole source for View citation, Copy BibTeX, and the BibTeX download. The build reads the file verbatim, escaping it only for safe HTML display; it never synthesizes or overwrites citation text. Missing or empty files stop the build with an explanatory error before any pages are written. Publication-card metadata remains in `data/site.json` and does not override citations. Yuliang Fu’s name is highlighted automatically.

News filters use the fixed order All, Milestone, Paper, Award, Travel, Others. Use these category names in the data. News is sorted by date, newest first; equal dates retain their data-file order. The scrollable news list initially fits six items, recalculating as text wraps or filters change. Older items remain accessible by scrolling. Preprints belong in the publications array only; do not add news entries for them. Use year-only dates when the month is unknown; do not invent publication, award, or travel dates.

## GitHub Pages

The generated site is committed at the repository root. In GitHub **Settings → Pages**, use **Deploy from a branch**, select the publishing branch, and select **/ (root)**. The `.nojekyll` file prevents Jekyll processing; no Ruby or GitHub Actions build is required. This reconstruction does not change remote settings or publish until the changes are pushed to the configured publishing branch.

The canonical URL in `data/site.json` is `https://fuyuliang02.github.io`. Root-relative links assume this user-site domain or a custom domain at its root, rather than a project site under a subdirectory. `/about/`, `/about.html`, and `/resume/` redirect to their replacements. Both previously used CV URLs serve the supplied latest CV.

## Pages and behavior

- **Home:** biography and background, research interests, categorized news, selected work, and profile contact links.
- **Publications:** thumbnails, ordered authors, venue information, paper links, downloadable/copyable BibTeX, keyword search, year and publication-type filters.
- **Experience:** research and industry experience, education, honors, academic service.
- **CV:** accessible summary, rendered document preview, direct PDF open/download links.
- **404:** navigation back to the site.

All content, paper links, citation disclosures, and navigation work without JavaScript. Filtering and clipboard copy are progressive enhancements. The site includes keyboard focus styles, a skip link, image descriptions, filter announcements, reduced-motion support, print styles, canonical links, social metadata, a sitemap, and structured person data.

## Content sources

Reconstructed from the owner-supplied `../resources/CV.pdf` and four supplied thumbnails, plus the former site's LinkedIn link and portrait. The provided CV contains the current email, Scholar profile, research history, publication author order, awards, and service. The original template and sample publications/posts have been removed; their prior versions remain in Git history.

Verified supporting links:

- [EpiPad publisher record](https://doi.org/10.1145/3810191), with June 2026 publication metadata verified through [Crossref](https://api.crossref.org/works/10.1145/3810191).
- [Advisor publication list](https://chenhanxu.github.io/publication/), including the three BSN 2025 papers and their author-hosted PDFs.
- [Advisor news](https://chenhanxu.github.io/), supporting June 2026 IMWUT and November 2025 BSN news dates.

Travel news reports documented travel awards; it does not assert undocumented attendance or upcoming travel. No placeholder projects, invented achievements, metrics, or unverified code/video links are included.

## Validation

`npm run check` verifies generated pages, local asset links, cross-page anchor targets, unique HTML IDs, publication count, author highlighting, displayed citations matching the `.bib` sources, the CV signature, and the GitHub Pages marker. Browser checks should also cover news filters, combined publication filters, empty results/reset, citation copy/download, responsive layouts, missing images, and navigation with JavaScript disabled.

Preprints use `type: "Preprint"` in the publication data. Maintain their full citation, including arXiv fields, in `files/<id>.bib`; data fields such as `arxiv` and `primaryClass` do not generate or update the citation. ActReal metadata comes from https://arxiv.org/abs/2608.30038.

After editing a `.bib` file, run `node scripts/build.mjs` and `node scripts/check.mjs` to refresh and verify the displayed/copyable text. Downloads serve the original file directly. Run `node --test scripts/citations.test.mjs` to verify manual citation preservation and missing-file handling in an isolated temporary site.
