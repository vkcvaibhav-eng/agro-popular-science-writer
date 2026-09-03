import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod/v4";

const TEMPLATE_URI = "ui://agro-popular-science-writer/workspace.html";

const AUTHOR_FRAMEWORKS = [
  {
    id: "pearson",
    name: "Gwen Pearson",
    framework: "Creature-first natural history",
    bestFor: "Insects, mites, behaviour, taxonomy, overlooked organisms and curiosity-led stories.",
    rules: [
      "Open with a precise observation of the organism.",
      "Translate biological detail into concrete, human-scale explanation.",
      "Use light curiosity only when it preserves scientific accuracy.",
      "Return to the organism in the final passage.",
    ],
  },
  {
    id: "stokstad",
    name: "Erik Stokstad",
    framework: "Evidence-led science reporting",
    bestFor: "New studies, field trials, research news and scientific or policy consequences.",
    rules: [
      "State the scientific problem and news peg early.",
      "Move from result to method to consequence.",
      "Separate reported evidence from interpretation.",
      "Close with the next research or policy question.",
    ],
  },
  {
    id: "milius",
    name: "Susan Milius",
    framework: "Compact biological surprise",
    bestFor: "Counterintuitive findings, odd adaptations and tightly focused biological stories.",
    rules: [
      "Lead with one defensible biological surprise.",
      "Keep paragraphs compact and concrete.",
      "Explain one central idea rather than surveying the field.",
      "End with the most informative unresolved question.",
    ],
  },
  {
    id: "simon",
    name: "Matt Simon",
    framework: "Mechanism in motion",
    bestFor: "Climate effects, technology, behaviour and cause-and-effect processes.",
    rules: [
      "Begin inside the process rather than with broad background.",
      "Use vivid but accurate verbs.",
      "Build an explicit causal chain and mark unsupported links.",
      "Connect the mechanism to a wider system without exaggeration.",
    ],
  },
  {
    id: "jarvis",
    name: "Brooke Jarvis",
    framework: "Immersive ecological narrative",
    bestFor: "Biodiversity, disappearance, human–nature relationships and layered ecological stakes.",
    rules: [
      "Open with a precise scene or revealing observation.",
      "Widen gradually from one detail to the ecological context.",
      "Keep organisms, people and uncertainty in the same frame.",
      "End with resonance rather than a simplified solution.",
    ],
  },
  {
    id: "blend",
    name: "Original editorial blend",
    framework: "Scene, evidence and explanation",
    bestFor: "General popular science when no named narrative mode clearly dominates.",
    rules: [
      "Open with a specific, verifiable hook.",
      "Present the central evidence before extended background.",
      "Explain the mechanism in plain language.",
      "End with significance and uncertainty together.",
    ],
  },
] as const;

type AuthorId = (typeof AUTHOR_FRAMEWORKS)[number]["id"];
type ReferenceKind = "journal" | "magazine" | "webpage" | "report";

type ReferenceRecord = {
  kind: ReferenceKind;
  authors: string;
  year: string;
  fullDate?: string;
  title: string;
  source?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doiOrUrl?: string;
  publisher?: string;
};

const authorIdSchema = z.enum(["pearson", "stokstad", "milius", "simon", "jarvis", "blend"]);
const referenceKindSchema = z.enum(["journal", "magazine", "webpage", "report"]);
const referenceSchema = z.object({
  kind: referenceKindSchema,
  authors: z.string().min(1).describe("Authors as Family, Given names separated by semicolons"),
  year: z.string().min(1),
  fullDate: z.string().optional(),
  title: z.string().min(1),
  source: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doiOrUrl: z.string().optional(),
  publisher: z.string().optional(),
});

function subjectLabel(subject: string) {
  const cleaned = subject.trim().replace(/[.?!]+$/, "");
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "The scientific subject";
}

function recommendAuthor(title: string, trend: string): AuthorId {
  const text = `${title} ${trend}`.toLowerCase();
  if (/(disappear|ecolog|biodiversity|cost|future|food system|at stake)/.test(text)) return "jarvis";
  if (/(inside|how |mechanism|cascade|warmer|climate|technology|detection)/.test(text)) return "simon";
  if (/(surpris|strange|odd|paradox|tiny|secret|unfinished)/.test(text)) return "milius";
  if (/(mite|insect|organism|hidden life|creature|behaviour)/.test(text)) return "pearson";
  if (/(evidence|study|research|scientist|control|policy|resistance)/.test(text)) return "stokstad";
  return "blend";
}

function makeTitleSuggestions(subjectInput: string, trend: string) {
  const subject = subjectLabel(subjectInput);
  const trendTitles: Record<string, string> = {
    "Climate pressure": `${subject} in a Warmer World: What Changes First?`,
    "Resistance evolution": `When Control Stops Working: The Evolutionary Story of ${subject}`,
    "Biological control": `Can Nature Restrain ${subject}? Inside the Search for Biological Control`,
    "Biodiversity change": `The Ecological Cost of ${subject}—and What We Still Do Not Know`,
    "New detection technology": `Seeing ${subject} Before the Damage Appears`,
    "Food-system relevance": `From Hidden Biology to Food Security: Why ${subject} Deserves Attention`,
    "Emerging research": `Why Scientists Are Watching ${subject}`,
  };

  const choices = [
    {
      title: trendTitles[trend] || `Why ${subject} Matters Now`,
      rationale: "Connects the subject directly to the selected current scientific pressure.",
    },
    {
      title: `The Hidden Life of ${subject}: What the Evidence Reveals`,
      rationale: "A curiosity-led title that promises evidence rather than speculation.",
    },
    {
      title: `Inside ${subject}: The Mechanism Behind a Growing Scientific Question`,
      rationale: "Best when the article has a clear biological or technological mechanism.",
    },
    {
      title: `A Small Signal With Large Consequences: Rethinking ${subject}`,
      rationale: "Uses a defensible contrast in scale to create a strong story promise.",
    },
    {
      title: `What ${subject} Can Teach Us About Change`,
      rationale: "Broadens the question while keeping the subject at the evidentiary centre.",
    },
    {
      title: `The Unfinished Science of ${subject}`,
      rationale: "Fits important evidence that remains uncertain, limited or contested.",
    },
  ];

  return choices.map((choice, index) => {
    const authorId = recommendAuthor(choice.title, trend);
    const author = AUTHOR_FRAMEWORKS.find((item) => item.id === authorId) || AUTHOR_FRAMEWORKS[5];
    return {
      id: index + 1,
      ...choice,
      authorId,
      authorName: author.name,
      framework: author.framework,
    };
  });
}

function ensurePeriod(value: string) {
  const text = value.trim();
  return text && !/[.?!]$/.test(text) ? `${text}.` : text;
}

function initialsFor(givenNames: string) {
  return givenNames
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part
      .split("-")
      .map((namePart) => {
        const letter = namePart.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "").charAt(0);
        return letter ? `${letter.toUpperCase()}.` : "";
      })
      .filter(Boolean)
      .join("-"))
    .filter(Boolean)
    .join(" ");
}

function parseAuthors(input: string) {
  return input
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      if (!entry.includes(",")) return { display: entry, family: entry };
      const [familyPart, ...givenParts] = entry.split(",");
      const family = familyPart.trim();
      const initials = initialsFor(givenParts.join(",").trim());
      return { display: initials ? `${family}, ${initials}` : family, family };
    });
}

function formatAuthors(input: string) {
  const authors = parseAuthors(input);
  if (!authors.length) return "[Author required]";
  if (authors.length === 1) return authors[0].display;
  if (authors.length === 2) return `${authors[0].display}, & ${authors[1].display}`;
  if (authors.length <= 20) {
    return `${authors.slice(0, -1).map((author) => author.display).join(", ")}, & ${authors.at(-1)?.display}`;
  }
  return `${authors.slice(0, 19).map((author) => author.display).join(", ")}, … ${authors.at(-1)?.display}`;
}

function normalizeDoiOrUrl(input = "") {
  const value = input.trim();
  if (!value) return "";
  if (/^10\.\d{4,9}\//i.test(value)) return `https://doi.org/${value}`;
  if (/^(doi:\s*|https?:\/\/(dx\.)?doi\.org\/)/i.test(value)) {
    return `https://doi.org/${value.replace(/^(doi:\s*|https?:\/\/(dx\.)?doi\.org\/)/i, "")}`;
  }
  return value;
}

function formatReference(reference: ReferenceRecord) {
  const authors = formatAuthors(reference.authors);
  const year = reference.year.trim() || "n.d.";
  const datedKind = reference.kind === "magazine" || reference.kind === "webpage";
  const date = datedKind && reference.fullDate?.trim() ? `(${year}, ${reference.fullDate.trim()}).` : `(${year}).`;
  const title = ensurePeriod(reference.title);
  const italicTitle = reference.title.trim().replace(/[.?!]+$/, "");
  const source = reference.source?.trim() || "";
  const volume = reference.volume?.trim() || "";
  const issue = reference.issue?.trim() || "";
  const pages = reference.pages?.trim() || "";
  const publisher = reference.publisher?.trim() || "";
  const link = normalizeDoiOrUrl(reference.doiOrUrl);
  const warnings: string[] = [];

  if (!/^\d{4}$|^n\.d\.$/i.test(year)) warnings.push("Use a four-digit year or n.d.");
  if (reference.kind !== "report" && !source) warnings.push("Source title is missing.");
  if (reference.kind === "journal" && !volume) warnings.push("Journal volume is missing.");
  if (reference.kind === "journal" && !pages) warnings.push("Page range or article number is missing.");
  if (reference.kind === "report" && !publisher) warnings.push("Publisher is missing; omit it only when it duplicates the author.");

  let formatted = "";
  if (reference.kind === "journal") {
    const journalVolume = volume ? `*${source}, ${volume}*` : `*${source}*`;
    formatted = `${authors} ${date} ${title} ${journalVolume}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.`;
  } else if (reference.kind === "magazine") {
    const magazine = volume ? `*${source}, ${volume}*` : `*${source}*`;
    formatted = `${authors} ${date} ${title} ${magazine}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.`;
  } else if (reference.kind === "report") {
    formatted = `${authors} ${date} *${italicTitle}*.${publisher ? ` ${publisher}.` : ""}`;
  } else {
    formatted = `${authors} ${date} *${italicTitle}*.${source ? ` ${source}.` : ""}`;
  }
  if (link) formatted += ` ${link}`;

  const parsed = parseAuthors(reference.authors);
  const inText = parsed.length === 1
    ? `(${parsed[0].family}, ${year})`
    : parsed.length === 2
      ? `(${parsed[0].family} & ${parsed[1].family}, ${year})`
      : `(${parsed[0]?.family || "Author"} et al., ${year})`;

  return { formatted: formatted.trim(), inText, warnings };
}

function createWriterServer(widgetHtml: string) {
  const server = new McpServer(
    { name: "agro-popular-science-writer", version: "0.1.0" },
    {
      capabilities: { tools: {}, resources: {} },
      instructions:
        "Use this server to open the subject-first agricultural popular-science workspace, format structured APA 7 references, and render a completed evidence-led article. Do not invent research, references, quotations, or trend claims. Named writers are high-level editorial frameworks only; keep wording original.",
    },
  );

  registerAppResource(
    server,
    "Agro Popular Science Writer workspace",
    TEMPLATE_URI,
    {
      description: "Interactive subject, title, author, evidence, reference and article workspace.",
      mimeType: RESOURCE_MIME_TYPE,
      _meta: {
        ui: {
          prefersBorder: true,
          csp: { connectDomains: [], resourceDomains: [] },
        },
      },
    },
    async () => ({
      contents: [
        {
          uri: TEMPLATE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: widgetHtml,
          _meta: {
            ui: {
              prefersBorder: true,
              csp: { connectDomains: [], resourceDomains: [] },
            },
          },
        },
      ],
    }),
  );

  registerAppTool(
    server,
    "open_article_workspace",
    {
      title: "Open article workspace",
      description:
        "Open the interactive Agro Popular Science Writer. Use when the user wants to plan, research, write, revise, or review a referenced agricultural popular-science article.",
      inputSchema: {
        subject: z.string().optional(),
        field: z.string().optional(),
        audience: z.string().optional(),
        articleForm: z.string().optional(),
        trend: z.string().optional(),
        whyNow: z.string().optional(),
        targetWords: z.number().int().min(500).max(3000).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI, visibility: ["model", "app"] },
      },
    },
    async (args) => {
      const brief = {
        subject: args.subject || "",
        field: args.field || "Agricultural entomology",
        audience: args.audience || "General science readers",
        articleForm: args.articleForm || "Popular science feature",
        trend: args.trend || "Emerging research",
        whyNow: args.whyNow || "",
        targetWords: args.targetWords || 1000,
      };
      const suggestions = makeTitleSuggestions(brief.subject, brief.trend);
      return {
        content: [{ type: "text" as const, text: "Opened the subject-first article workspace." }],
        structuredContent: {
          view: "workspace",
          brief,
          suggestions,
          authors: AUTHOR_FRAMEWORKS,
        },
      };
    },
  );

  server.registerTool(
    "suggest_titles",
    {
      title: "Suggest article titles",
      description:
        "Create subject-first popular-science title options and recommend an editorial framework for each. A title is not a verified trend claim; research must support the why-now angle.",
      inputSchema: {
        subject: z.string().min(2),
        trend: z.string().default("Emerging research"),
        whyNow: z.string().optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async ({ subject, trend, whyNow }) => {
      const suggestions = makeTitleSuggestions(subject, trend);
      return {
        content: [
          {
            type: "text" as const,
            text: `Prepared ${suggestions.length} title options. Verify the current angle${whyNow ? `: ${whyNow}` : " before publication"}.`,
          },
        ],
        structuredContent: { view: "titles", suggestions, authors: AUTHOR_FRAMEWORKS },
      };
    },
  );

  server.registerTool(
    "format_apa7_reference",
    {
      title: "Format APA 7 reference",
      description:
        "Format one structured journal, magazine, webpage, or report reference in APA 7 style. This checks structure only; always verify the source and metadata against the original.",
      inputSchema: referenceSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (reference) => {
      const result = formatReference(reference);
      return {
        content: [{ type: "text" as const, text: result.formatted }],
        structuredContent: { view: "reference", reference, ...result },
      };
    },
  );

  server.registerTool(
    "prepare_article_request",
    {
      title: "Prepare referenced article request",
      description:
        "Validate and return a complete article brief selected in the UI. After this tool, research the supplied why-now angle and references, build a claim-to-source map, draft the article, then call render_article.",
      inputSchema: {
        subject: z.string().min(2),
        field: z.string().min(2),
        audience: z.string().min(2),
        articleForm: z.string().min(2),
        trend: z.string().min(2),
        whyNow: z.string().min(10),
        targetWords: z.number().int().min(500).max(3000),
        selectedTitle: z.string().min(4),
        authorId: authorIdSchema,
        evidence: z.object({
          finding: z.string().min(10),
          mechanism: z.string().min(10),
          significance: z.string().min(10),
          uncertainty: z.string().min(10),
          expertVoice: z.string().optional(),
        }),
        references: z.array(referenceSchema).min(2),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (request) => {
      const author = AUTHOR_FRAMEWORKS.find((item) => item.id === request.authorId) || AUTHOR_FRAMEWORKS[5];
      const formattedReferences = request.references.map(formatReference);
      const warnings = formattedReferences.flatMap((item) => item.warnings);
      const articleRequest = {
        ...request,
        selectedAuthor: author,
        formattedReferences,
        requirements: [
          "Research and verify the why-now statement with current reliable sources.",
          "Map each central claim to supporting evidence before drafting.",
          "Use original wording within the selected high-level editorial framework.",
          "Include matched author-date citations and an alphabetized APA 7 reference list.",
          "State meaningful limitations and do not invent quotations or bibliography fields.",
        ],
      };
      return {
        content: [
          {
            type: "text" as const,
            text: `The article brief is ready for research and drafting. Selected framework: ${author.name} — ${author.framework}.${warnings.length ? ` Reference warnings: ${[...new Set(warnings)].join(" ")}` : ""}`,
          },
        ],
        structuredContent: { view: "article-request", articleRequest },
      };
    },
  );

  registerAppTool(
    server,
    "render_article",
    {
      title: "Render finished article",
      description:
        "Render the final checked article in the interactive workspace. Call only after researching and drafting from a prepared request. Provide the complete article, matched reference list, selected framework, and concise verification notes.",
      inputSchema: {
        title: z.string().min(4),
        authorFramework: z.string().min(2),
        article: z.string().min(100),
        references: z.array(z.string()).min(2),
        verificationNotes: z.array(z.string()).default([]),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI, visibility: ["model"] },
      },
    },
    async ({ title, authorFramework, article, references, verificationNotes }) => ({
      content: [{ type: "text" as const, text: `Rendered “${title}” in the article workspace.` }],
      structuredContent: {
        view: "article",
        title,
        authorFramework,
        article,
        references,
        verificationNotes,
      },
    }),
  );

  return server;
}

export async function handleMcpRequest(request: Request, widgetHtml: string) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createWriterServer(widgetHtml);
  await server.connect(transport);
  const response = await transport.handleRequest(request);
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Expose-Headers", "mcp-session-id, mcp-protocol-version");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function mcpCorsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id, last-event-id, mcp-protocol-version",
      "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
    },
  });
}
