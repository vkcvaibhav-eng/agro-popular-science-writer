# Agro Popular Science Writer

An evidence-led English agricultural popular-science writing workspace. It turns a subject and research brief into an editable article, applies a selected narrative framework, validates references, and exports a Word-compatible file.

The project supports two complementary interfaces:

- A standalone web editor at `https://agro-popular-science-writer.vkcvaibhav.chatgpt.site`.
- A chat-first Codex skill that researches current evidence, proposes titles, recommends an editorial framework and writes the referenced article without external API keys.

## What it does

- Starts with the scientific subject, field, audience, article form and current trend angle—without region or location targeting.
- Suggests six subject-first popular-science titles and recommends the best-fit author framework for each title.
- Lets the editor choose among all ten selected author frameworks, override the recommendation and review the strict rules for every framework.
- Requires a central finding, mechanism, significance, uncertainty and at least two complete references before drafting.
- Formats journal articles, magazine articles, webpages and reports in APA 7 structure, including DOI normalization, italics and hanging indents.
- Builds in-text citations from the supplied references and does not invent missing evidence or quotations.
- Uses the selected framework as a second-pass editor, revises weak sections, runs a final fact lock and displays the complete final article in chat.
- Scores final framework alignment with an eight-category, 100-point rubric and gives an evidence-based editorial verdict.
- Copies the article or downloads it as an editable Word-compatible `.doc` file.

## Editorial lenses

- Gwen Pearson: creature-first natural history
- Erik Stokstad: evidence-led reporting
- Susan Milius: compact biological action and surprise
- Matt Simon: conversational mechanism in motion
- Brooke Jarvis: immersive ecological narrative and suspense
- Oliver Milman: consequence-led environmental reporting
- Gabriel Popkin: complexity and counterevidence
- Carrie Arnold: scientific mystery and evidence trail
- Dave Goulson: scientist-led persuasive ecology
- Dan Charles: causal systems and practical trade-offs
- Original editorial blend: scene + evidence + explanation

The frameworks apply analysed, high-level narrative architecture while preserving original wording. They do not reproduce signature phrases or imitate an author's exact voice.

## APA 7 reference input

Enter authors as `Family name, Given names`, separated by semicolons. The app creates initials and punctuation, alphabetizes the list, italicizes journal and magazine source elements where required, and converts bare DOIs to `https://doi.org/...` form.

## Codex skill

The skill source is located at:

```text
plugin/agro-popular-science-writer/skills/agro-popular-science-writer/SKILL.md
```

The installable plugin source is in `plugin/agro-popular-science-writer`. It contains the plugin manifest, writing skill, APA 7 checks and editorial-framework guidance. It is deliberately skill-only: it has no MCP or external API dependency.

When the repository is opened with Codex, ask:

```text
Use the Agro Popular Science Writer skill for [your scientific subject].
```

The skill first researches and suggests five to seven evidence-backed titles. It pauses for title and framework selection, then builds the evidence map, verifies bibliographic metadata and drafts the article with APA 7 references. After drafting, the selected framework acts as an editorial lens: it audits and revises the article, locks facts and citations, displays the complete final version in chat, and scores framework alignment out of 100.

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
