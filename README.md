# Agro Popular Science Writer

An evidence-led English agricultural popular-science writing workspace. It turns a subject and research brief into an editable article, applies a selected narrative framework, validates references, and exports a Word-compatible file.

## What it does

- Starts with the scientific subject, field, audience, article form and current trend angle—without region or location targeting.
- Suggests six subject-first popular-science titles and recommends the best-fit author framework for each title.
- Lets the editor override the recommendation and review the strict rules for every framework.
- Requires a central finding, mechanism, significance, uncertainty and at least two complete references before drafting.
- Formats journal articles, magazine articles, webpages and reports in APA 7 structure, including DOI normalization, italics and hanging indents.
- Builds in-text citations from the supplied references and does not invent missing evidence or quotations.
- Copies the article or downloads it as an editable Word-compatible `.doc` file.

## Editorial lenses

- Gwen Pearson: creature-first natural history
- Erik Stokstad: evidence-led reporting
- Susan Milius: compact, surprising science
- Matt Simon: mechanism in motion
- Brooke Jarvis: immersive ecological narrative
- Original editorial blend: scene + evidence + explanation

The frameworks apply analysed, high-level narrative architecture while preserving original wording. They do not reproduce signature phrases or imitate an author's exact voice.

## APA 7 reference input

Enter authors as `Family name, Given names`, separated by semicolons. The app creates initials and punctuation, alphabetizes the list, italicizes journal and magazine source elements where required, and converts bare DOIs to `https://doi.org/...` form.

## Run locally

```bash
npm install
npm run dev
```

Then open the local address printed by the development server.

## Validate a production build

```bash
npm run build
```

## Editorial safeguard

The software is an editorial aid, not a source-verification service. Every finding, quotation, trend claim and bibliographic field must be checked against the original source before publication.
