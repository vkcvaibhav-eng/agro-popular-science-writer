"use client";

import { useMemo, useState } from "react";
import {
  BookOpenText,
  Check,
  ChevronRight,
  Clipboard,
  Download,
  FileCheck2,
  LibraryBig,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AuthorId =
  | "pearson"
  | "stokstad"
  | "milius"
  | "simon"
  | "jarvis"
  | "milman"
  | "popkin"
  | "arnold"
  | "goulson"
  | "charles"
  | "blend";
type ReferenceKind = "journal" | "magazine" | "webpage" | "report";

type Brief = {
  subject: string;
  field: string;
  audience: string;
  goal: string;
  trend: string;
  whyNow: string;
  targetWords: number;
};

type Evidence = {
  finding: string;
  mechanism: string;
  significance: string;
  uncertainty: string;
  expertVoice: string;
};

type ReferenceRecord = {
  id: string;
  kind: ReferenceKind;
  authors: string;
  year: string;
  fullDate: string;
  title: string;
  source: string;
  volume: string;
  issue: string;
  pages: string;
  doiOrUrl: string;
  publisher: string;
};

type TitleSuggestion = {
  id: number;
  title: string;
  rationale: string;
  author: AuthorId;
};

const AUTHORS: Array<{
  id: AuthorId;
  name: string;
  framework: string;
  bestFor: string;
  rules: string[];
  sections: [string, string, string];
}> = [
  {
    id: "pearson",
    name: "Gwen Pearson",
    framework: "Creature-first natural history",
    bestFor: "Insects, mites, behaviour, overlooked organisms and curiosity-led stories.",
    rules: [
      "Open with the organism or a close observation.",
      "Use approachable humour sparingly, never at the cost of accuracy.",
      "Translate taxonomy and behaviour into concrete human-scale images.",
      "Return to the organism in the final paragraph.",
    ],
    sections: ["Meet the organism", "The detail that changes the story", "Why the science matters"],
  },
  {
    id: "stokstad",
    name: "Erik Stokstad",
    framework: "Evidence-led science reporting",
    bestFor: "New studies, policy consequences, field trials and research with a clear news peg.",
    rules: [
      "State the news or scientific problem early.",
      "Move from finding to method to consequence.",
      "Distinguish reported evidence from interpretation.",
      "Close with the next research or policy question.",
    ],
    sections: ["The scientific question", "What the evidence shows", "What the finding changes"],
  },
  {
    id: "milius",
    name: "Susan Milius",
    framework: "Compact biological surprise",
    bestFor: "Odd adaptations, counterintuitive results and short, sharply focused science features.",
    rules: [
      "Lead with one surprising biological contradiction.",
      "Keep paragraphs compact and concrete.",
      "Explain one central idea instead of surveying the whole field.",
      "End on the most intriguing unresolved question.",
    ],
    sections: ["The biological surprise", "A clue in the evidence", "The question behind the oddity"],
  },
  {
    id: "simon",
    name: "Matt Simon",
    framework: "Mechanism in motion",
    bestFor: "Climate effects, technology, behaviour and processes that unfold as a chain of causes.",
    rules: [
      "Begin inside the process, not with background.",
      "Use vivid verbs to make the mechanism move.",
      "Build a clear cause-and-effect cascade.",
      "Connect the mechanism to a wider system without exaggeration.",
    ],
    sections: ["Inside the mechanism", "The cascade", "Why the process reaches beyond itself"],
  },
  {
    id: "jarvis",
    name: "Brooke Jarvis",
    framework: "Immersive ecological narrative",
    bestFor: "Biodiversity, disappearance, human–nature relationships and stories with layered stakes.",
    rules: [
      "Open with a precise scene or revealing moment.",
      "Widen gradually from an individual detail to ecological stakes.",
      "Keep people, organisms and uncertainty in the same narrative frame.",
      "Close with resonance rather than a simplified solution.",
    ],
    sections: ["The revealing moment", "The widening circle", "What is at stake"],
  },
  {
    id: "milman",
    name: "Oliver Milman",
    framework: "Threat-to-consequence environmental reporting",
    bestFor: "Insect decline, pesticides, climate pressure and conservation stories with measurable urgency.",
    rules: [
      "Lead with a documented change or evidence-backed threat.",
      "Trace consequences from the organism to ecosystems and people.",
      "Represent competing explanations and realistic responses.",
      "Create urgency from evidence, not unsupported catastrophe.",
    ],
    sections: ["The warning signal", "Following the consequences", "What a response requires"],
  },
  {
    id: "popkin",
    name: "Gabriel Popkin",
    framework: "Landscape-to-system science narrative",
    bestFor: "Field ecology, soils, forests, climate and research that connects observations across scales.",
    rules: [
      "Anchor the story in a concrete observation or measurement.",
      "Move deliberately from plot or organism to landscape and system.",
      "Show how scientific methods reveal otherwise hidden connections.",
      "End with the larger implication and its remaining uncertainty.",
    ],
    sections: ["A signal in the field", "Across scales", "The larger system"],
  },
  {
    id: "arnold",
    name: "Carrie Arnold",
    framework: "Scientific mystery and evidence trail",
    bestFor: "Unexplained outbreaks, competing hypotheses, disease ecology and evidence that changes direction.",
    rules: [
      "Begin with a clearly defined scientific puzzle.",
      "Follow the evidence as a sequence of testable clues.",
      "Show how competing hypotheses are supported or eliminated.",
      "Resolve only what the evidence allows and leave the open question visible.",
    ],
    sections: ["The puzzle", "Following the evidence", "What the clues can support"],
  },
  {
    id: "goulson",
    name: "Dave Goulson",
    framework: "Accessible ecology and conservation",
    bestFor: "Pollinators, pesticides, gardens, natural history and practical conservation implications.",
    rules: [
      "Begin with a familiar organism or ecological encounter.",
      "Explain interdependence in clear, concrete language.",
      "Connect evidence to practical choices without preaching.",
      "Close with a feasible implication supported by the science.",
    ],
    sections: ["The familiar encounter", "The web of dependence", "What the evidence makes possible"],
  },
  {
    id: "charles",
    name: "Dan Charles",
    framework: "People-centred agricultural reporting",
    bestFor: "Food systems, agricultural decisions, technology adoption and evidence with practical trade-offs.",
    rules: [
      "Open with a real decision or trade-off created by the subject.",
      "Translate methods and results into practical stakes.",
      "Represent benefits, costs and affected perspectives fairly.",
      "Close with what the evidence can and cannot justify in practice.",
    ],
    sections: ["The decision", "Evidence in practice", "The trade-off that remains"],
  },
  {
    id: "blend",
    name: "Original editorial blend",
    framework: "Scene, evidence and explanation",
    bestFor: "General-purpose popular science when no single narrative mode clearly dominates.",
    rules: [
      "Open with a specific, verifiable hook.",
      "Put the central evidence before extended background.",
      "Explain mechanism in plain language.",
      "End with significance and uncertainty together.",
    ],
    sections: ["The question", "How the evidence fits", "Why it matters now"],
  },
];

function authorById(id: AuthorId) {
  return AUTHORS.find((author) => author.id === id) ?? AUTHORS[AUTHORS.length - 1];
}

const DEFAULT_BRIEF: Brief = {
  subject: "Mites as hidden drivers of crop stress",
  field: "Agricultural entomology",
  audience: "General science readers",
  goal: "Popular science feature",
  trend: "Climate pressure",
  whyNow: "Recent research is testing how heat, humidity and altered crop seasons change mite outbreaks and detection.",
  targetWords: 1000,
};

const DEFAULT_EVIDENCE: Evidence = {
  finding: "",
  mechanism: "",
  significance: "",
  uncertainty: "",
  expertVoice: "",
};

const EMPTY_REFERENCE: Omit<ReferenceRecord, "id"> = {
  kind: "journal",
  authors: "",
  year: "",
  fullDate: "",
  title: "",
  source: "",
  volume: "",
  issue: "",
  pages: "",
  doiOrUrl: "",
  publisher: "",
};

function subjectLabel(subject: string) {
  const cleaned = subject.trim().replace(/[.?!]+$/, "");
  return cleaned || "the subject";
}

function recommendAuthor(title: string, trend: string): AuthorId {
  const text = (title + " " + trend).toLowerCase();
  if (/(pollinat|bumblebee|\bbee\b|garden|pesticide|conservation)/.test(text)) return "goulson";
  if (/(food system|food security|agricultur|farm|adoption|market|consumer|trade-off|practice)/.test(text)) return "charles";
  if (/(mystery|clue|puzzle|outbreak|diagnos|unexplained|investigat)/.test(text)) return "arnold";
  if (/(landscape|soil|forest|carbon|remote sensing|across scales|global system)/.test(text)) return "popkin";
  if (/(decline|extinction|crisis|threat|vanish|collapse)/.test(text)) return "milman";
  if (/(disappear|ecolog|biodiversity|cost|future|food system|at stake)/.test(text)) return "jarvis";
  if (/(inside|how |mechanism|cascade|warmer|climate|technology|detection)/.test(text)) return "simon";
  if (/(surpris|strange|odd|paradox|tiny|secret)/.test(text)) return "milius";
  if (/(mite|insect|organism|hidden life|creature|behaviour)/.test(text)) return "pearson";
  if (/(evidence|study|research|scientist|control|policy|resistance)/.test(text)) return "stokstad";
  return "blend";
}

function makeTitleSuggestions(brief: Brief): TitleSuggestion[] {
  const subject = subjectLabel(brief.subject);
  const trendTitles: Record<string, string> = {
    "Climate pressure": subject + " in a Warmer World: What Changes First?",
    "Resistance evolution": "When Control Stops Working: The Evolutionary Story of " + subject,
    "Biological control": "Can Nature Restrain " + subject + "? Inside the Search for Biological Control",
    "Biodiversity change": "The Ecological Cost of " + subject + "—and What We Still Do Not Know",
    "New detection technology": "Seeing " + subject + " Before the Damage Appears",
    "Food-system relevance": "From Hidden Biology to Food Security: Why " + subject + " Deserves Attention",
    "Emerging research": "Why Scientists Are Watching " + subject,
  };
  const raw = [
    {
      title: trendTitles[brief.trend] || "Why " + subject + " Matters Now",
      rationale: "Connects the subject directly to the selected current scientific pressure.",
    },
    {
      title: "The Hidden Life of " + subject + ": What the Evidence Reveals",
      rationale: "A curiosity-led title that promises evidence rather than speculation.",
    },
    {
      title: "Inside " + subject + ": The Mechanism Behind a Growing Scientific Question",
      rationale: "Best when the article has a strong biological or technological mechanism.",
    },
    {
      title: "A Small Signal With Large Consequences: Rethinking " + subject,
      rationale: "Uses scale contrast, a reliable popular-science title device.",
    },
    {
      title: "What " + subject + " Can Teach Us About Change",
      rationale: "Broadens the topic while keeping the subject as the evidence-bearing centre.",
    },
    {
      title: "The Unfinished Science of " + subject,
      rationale: "Strong for evidence that is important but still uncertain or contested.",
    },
  ];

  return raw.map((item, index) => ({
    id: index,
    title: item.title,
    rationale: item.rationale,
    author: recommendAuthor(item.title, brief.trend),
  }));
}

function ensurePeriod(value: string) {
  const text = value.trim();
  if (!text) return "";
  return /[.?!]$/.test(text) ? text : text + ".";
}

function initialsFor(givenNames: string) {
  return givenNames
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => {
      const letter = part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "").charAt(0);
      return letter ? letter.toUpperCase() + "." : "";
    })
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
      const pieces = entry.split(",");
      const family = pieces[0].trim();
      const given = pieces.slice(1).join(",").trim();
      const initials = /^[A-Za-zÀ-ÖØ-öø-ÿ](?:\.|\s|-[A-Za-zÀ-ÖØ-öø-ÿ]\.?)+$/.test(given)
        ? given.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])(?!\.)/g, "$1.")
        : initialsFor(given);
      return { display: family + ", " + initials, family };
    });
}

function formatAuthors(input: string) {
  const authors = parseAuthors(input);
  if (!authors.length) return "[Author required]";
  if (authors.length === 1) return authors[0].display;
  if (authors.length === 2) return authors[0].display + ", & " + authors[1].display;
  if (authors.length <= 20) {
    return authors.slice(0, -1).map((author) => author.display).join(", ") + ", & " + authors[authors.length - 1].display;
  }
  return authors.slice(0, 19).map((author) => author.display).join(", ") + ", … " + authors[authors.length - 1].display;
}

function normalizeDoiOrUrl(input: string) {
  const value = input.trim();
  if (!value) return "";
  if (/^10\.\d{4,9}\//i.test(value)) return "https://doi.org/" + value;
  if (/^(doi:\s*|https?:\/\/(dx\.)?doi\.org\/)/i.test(value)) {
    return "https://doi.org/" + value.replace(/^(doi:\s*|https?:\/\/(dx\.)?doi\.org\/)/i, "");
  }
  return value;
}

function formattedDate(reference: ReferenceRecord) {
  const year = reference.year.trim() || "n.d.";
  if (reference.kind === "journal" || reference.kind === "report" || !reference.fullDate.trim()) {
    return "(" + year + ").";
  }
  return "(" + year + ", " + reference.fullDate.trim() + ").";
}

function formatApa(reference: ReferenceRecord) {
  const authors = formatAuthors(reference.authors);
  const date = formattedDate(reference);
  const title = ensurePeriod(reference.title);
  const link = normalizeDoiOrUrl(reference.doiOrUrl);

  if (reference.kind === "journal") {
    const journalAndVolume = reference.volume.trim()
      ? "*" + reference.source.trim() + ", " + reference.volume.trim() + "*"
      : "*" + reference.source.trim() + "*";
    const issue = reference.issue.trim() ? "(" + reference.issue.trim() + ")" : "";
    const pages = reference.pages.trim() ? ", " + reference.pages.trim() : "";
    return authors + " " + date + " " + title + " " + journalAndVolume + issue + pages + "." + (link ? " " + link : "");
  }

  if (reference.kind === "magazine") {
    const pages = reference.pages.trim() ? ", " + reference.pages.trim() : "";
    return authors + " " + date + " " + title + " *" + reference.source.trim() + "*" + pages + "." + (link ? " " + link : "");
  }

  if (reference.kind === "report") {
    const publisher = reference.publisher.trim() ? " " + reference.publisher.trim() + "." : "";
    return authors + " " + date + " *" + title + "*" + publisher + (link ? " " + link : "");
  }

  return authors + " " + date + " *" + title + "* " + reference.source.trim() + "." + (link ? " " + link : "");
}

function referenceErrors(reference: ReferenceRecord) {
  const errors: string[] = [];
  if (!reference.authors.trim()) errors.push("author");
  if (!/^(\d{4}|n\.d\.)$/i.test(reference.year.trim())) errors.push("year");
  if (!reference.title.trim()) errors.push("title");
  if (!reference.source.trim() && reference.kind !== "report") errors.push("source");
  if (reference.kind === "journal" && !reference.volume.trim()) errors.push("volume");
  if (reference.kind === "journal" && !reference.pages.trim()) errors.push("pages or article number");
  if (reference.kind === "report" && !reference.publisher.trim()) errors.push("publisher");
  return errors;
}

function inTextCitation(reference: ReferenceRecord) {
  const authors = parseAuthors(reference.authors);
  const year = reference.year.trim() || "n.d.";
  if (!authors.length) return "(Author, " + year + ")";
  if (authors.length === 1) return "(" + authors[0].family + ", " + year + ")";
  if (authors.length === 2) return "(" + authors[0].family + " & " + authors[1].family + ", " + year + ")";
  return "(" + authors[0].family + " et al., " + year + ")";
}

function citationCluster(references: ReferenceRecord[]) {
  const citations = references.slice(0, 3).map((reference) => inTextCitation(reference).slice(1, -1));
  return citations.length ? "(" + citations.join("; ") + ")" : "[citation required]";
}

function sortedReferences(references: ReferenceRecord[]) {
  return [...references].sort((a, b) => {
    const aFamily = parseAuthors(a.authors)[0]?.family || "";
    const bFamily = parseAuthors(b.authors)[0]?.family || "";
    return aFamily.localeCompare(bFamily);
  });
}

function openingFor(author: AuthorId, brief: Brief, evidence: Evidence, citations: string) {
  const subject = subjectLabel(brief.subject);
  const signal = brief.whyNow.trim() || "The subject is receiving renewed scientific attention.";
  const finding = evidence.finding.trim() || "[central finding required]";
  const openings: Record<AuthorId, string> = {
    pearson:
      "Look closely at " + subject + " and the ordinary becomes crowded with biological decisions. " +
      signal + " The important detail is easy to miss: " + finding + " " + citations,
    stokstad:
      signal + " The evidence now centres on a specific result: " + finding + " " + citations +
      " The finding matters because it changes how researchers frame the larger problem.",
    milius:
      "The strange thing about " + subject + " is not simply that it matters. It is that the smallest detail can overturn the obvious explanation. " +
      finding + " " + citations,
    simon:
      "The process begins before most observers can see its consequences. One biological change triggers another, turning " +
      subject + " into a moving system rather than a static problem. " + finding + " " + citations,
    jarvis:
      "At first, " + subject + " can seem like a narrow scientific concern. Stay with the evidence, however, and a wider story appears—one that connects living systems, human choices and uncertain futures. " +
      signal + " " + citations,
    milman:
      "The warning is measurable, not rhetorical. " + signal + " The documented signal is " +
      finding + " " + citations + " Following that signal reveals who and what may carry the consequences.",
    popkin:
      "A single observation of " + subject + " can expose a process operating far beyond its immediate scale. " +
      finding + " " + citations + " The task is to follow that connection without losing sight of how it was measured.",
    arnold:
      "The story begins with a scientific puzzle: what can explain the changing evidence around " + subject + "? " +
      finding + " " + citations + " Each result is a clue, but no clue should be asked to prove more than it can.",
    goulson:
      subject + " belongs to a web of ordinary ecological relationships that is easy to overlook. " +
      finding + " " + citations + " Understanding those connections is the first step toward judging what action the evidence supports.",
    charles:
      "The science of " + subject + " creates a practical decision, not merely an abstract question. " +
      finding + " " + citations + " The significance lies in how evidence changes the available choices and their trade-offs.",
    blend:
      signal + " At the centre of the story is a finding that is both specific and consequential: " +
      finding + " " + citations,
  };
  return openings[author];
}

function closingFor(author: AuthorId, subject: string, uncertainty: string) {
  const endings: Record<AuthorId, string> = {
    pearson:
      "The final lesson is to keep looking closely. " + subject + " is not background detail; it is a living clue to how the system works. " + uncertainty,
    stokstad:
      "The result clarifies the question without closing it. The next step is to test where the pattern holds, where it fails and what evidence would justify action. " + uncertainty,
    milius:
      "The oddity remains useful precisely because it is unresolved. " + uncertainty,
    simon:
      "Once the mechanism is visible, the wider consequence is harder to ignore. But a plausible chain is not the same as a completed one. " + uncertainty,
    jarvis:
      "The story ends where observation begins again: with a system still changing and with consequences that resist a simple conclusion. " + uncertainty,
    milman:
      "The warning deserves attention because its consequences can be traced, not because the future is predetermined. What happens next depends on evidence, choices and the limits that remain. " + uncertainty,
    popkin:
      "A single measurement becomes meaningful when its place in the larger system is visible. The remaining task is to learn where that connection holds and where scale changes the answer. " + uncertainty,
    arnold:
      "The evidence resolves part of the mystery, but not all of it. The unanswered clue is therefore a research direction rather than a gap to disguise. " + uncertainty,
    goulson:
      "The ecological connection is close enough to observe and important enough to protect, but any response should remain proportionate to the evidence. " + uncertainty,
    charles:
      "The science clarifies the trade-off without making the decision automatic. Its practical value depends on where the result holds, who carries the cost and what remains uncertain. " + uncertainty,
    blend:
      "The evidence makes the subject clearer, not simpler. " + uncertainty + " That boundary between what is known and what remains open is part of the story.",
  };
  return endings[author];
}

function buildDraft(
  brief: Brief,
  evidence: Evidence,
  title: string,
  authorId: AuthorId,
  references: ReferenceRecord[],
) {
  const author = authorById(authorId);
  const citations = citationCluster(references);
  const subject = subjectLabel(brief.subject);
  const finding = evidence.finding.trim();
  const mechanism = evidence.mechanism.trim();
  const significance = evidence.significance.trim();
  const uncertainty = evidence.uncertainty.trim();
  const expert = evidence.expertVoice.trim();
  const referenceList = sortedReferences(references)
    .map((reference) => "- " + formatApa(reference))
    .join("\n");
  const expertSection = expert
    ? "\n\n## Expert perspective\n\n" + expert + " This perspective is included only as supplied and should be checked against the original interview, transcript or publication."
    : "";

  return (
    "# " + title +
    "\n\n" + openingFor(authorId, brief, evidence, citations) +
    "\n\n## " + author.sections[0] +
    "\n\n" + finding + " " + citations +
    "\n\nA popular-science article earns attention by making the evidence legible, not by making it louder. The scale of the observation, the method used to obtain it and the limits of comparison should remain visible. A result from one experiment is a result from one experiment; a broader claim needs broader support." +
    "\n\n## " + author.sections[1] +
    "\n\n" + mechanism + " " + citations +
    "\n\nMechanism is the bridge between a result and an explanation. Each step in that bridge should be supported: what changed, what caused the change, how it was measured and which alternative explanations remain possible. Technical terms belong only when they add precision, and each should be translated at first use." +
    "\n\n## " + author.sections[2] +
    "\n\n" + significance +
    "\n\nThe significance should be proportional to the evidence. The aim is not to promise a universal solution but to show why this finding changes a scientific question, a research priority or the way readers understand the living system. " +
    (brief.whyNow.trim() ? brief.whyNow.trim() : "") +
    expertSection +
    "\n\n## What remains uncertain\n\n" + uncertainty +
    "\n\n" + closingFor(authorId, subject, uncertainty) +
    "\n\n## References\n\n" + referenceList
  );
}

function countWords(text: string) {
  return text.replace(/^#+\s+/gm, "").trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(input: string) {
  return escapeHtml(input).replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function InlineText({ text }: { text: string }) {
  const pieces = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {pieces.map((piece, index) =>
        piece.startsWith("*") && piece.endsWith("*") ? (
          <em key={index}>{piece.slice(1, -1)}</em>
        ) : (
          <span key={index}>{piece}</span>
        ),
      )}
    </>
  );
}

export default function Home() {
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF);
  const [evidence, setEvidence] = useState<Evidence>(DEFAULT_EVIDENCE);
  const [suggestions, setSuggestions] = useState(() => makeTitleSuggestions(DEFAULT_BRIEF));
  const [selectedTitle, setSelectedTitle] = useState(suggestions[0].title);
  const initialRecommendation = suggestions[0].author;
  const [recommendedAuthor, setRecommendedAuthor] = useState<AuthorId>(initialRecommendation);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorId>(initialRecommendation);
  const [referenceForm, setReferenceForm] = useState<Omit<ReferenceRecord, "id">>(EMPTY_REFERENCE);
  const [references, setReferences] = useState<ReferenceRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [requestCopied, setRequestCopied] = useState(false);
  const activeAuthor = authorById(selectedAuthor);
  const recommendation = authorById(recommendedAuthor);
  const referenceFormErrors = referenceErrors({ ...referenceForm, id: "draft" });
  const allReferencesValid = references.length > 0 && references.every((reference) => referenceErrors(reference).length === 0);
  const canDraft =
    Boolean(selectedTitle.trim()) &&
    Boolean(evidence.finding.trim()) &&
    Boolean(evidence.mechanism.trim()) &&
    Boolean(evidence.significance.trim()) &&
    Boolean(evidence.uncertainty.trim()) &&
    references.length >= 2 &&
    allReferencesValid;
  const words = useMemo(() => countWords(draft), [draft]);
  const lowerBound = Math.round(brief.targetWords * 0.85);
  const upperBound = Math.round(brief.targetWords * 1.15);
  const sorted = useMemo(() => sortedReferences(references), [references]);

  function updateBrief<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function updateEvidence<K extends keyof Evidence>(key: K, value: Evidence[K]) {
    setEvidence((current) => ({ ...current, [key]: value }));
  }

  function refreshTitles() {
    const next = makeTitleSuggestions(brief);
    setSuggestions(next);
    setSelectedTitle(next[0].title);
    setRecommendedAuthor(next[0].author);
    setSelectedAuthor(next[0].author);
    setDraft("");
  }

  function chooseTitle(suggestion: TitleSuggestion) {
    setSelectedTitle(suggestion.title);
    setRecommendedAuthor(suggestion.author);
    setSelectedAuthor(suggestion.author);
    setDraft("");
  }

  function updateReference<K extends keyof Omit<ReferenceRecord, "id">>(
    key: K,
    value: Omit<ReferenceRecord, "id">[K],
  ) {
    setReferenceForm((current) => ({ ...current, [key]: value }));
  }

  function addReference() {
    const record = { ...referenceForm, id: crypto.randomUUID() };
    if (referenceErrors(record).length) return;
    setReferences((current) => [...current, record]);
    setReferenceForm(EMPTY_REFERENCE);
    setDraft("");
  }

  function removeReference(id: string) {
    setReferences((current) => current.filter((reference) => reference.id !== id));
    setDraft("");
  }

  function generateDraft() {
    if (!canDraft) return;
    setDraft(buildDraft(brief, evidence, selectedTitle, selectedAuthor, references));
    setCopied(false);
  }

  async function copySkillRequest() {
    const suppliedEvidence = [
      evidence.finding.trim() ? "Central finding: " + evidence.finding.trim() : "",
      evidence.mechanism.trim() ? "Mechanism: " + evidence.mechanism.trim() : "",
      evidence.significance.trim() ? "Significance: " + evidence.significance.trim() : "",
      evidence.uncertainty.trim() ? "Uncertainty: " + evidence.uncertainty.trim() : "",
      evidence.expertVoice.trim() ? "Expert material: " + evidence.expertVoice.trim() : "",
    ].filter(Boolean);
    const suppliedReferences = sortedReferences(references).map((reference) => formatApa(reference));
    const request = [
      "Use the Agro Popular Science Writer skill for this assignment.",
      "",
      "Scientific subject: " + subjectLabel(brief.subject),
      "Selected title: " + selectedTitle,
      "Selected editorial framework: " + activeAuthor.name + " — " + activeAuthor.framework,
      "Field: " + brief.field,
      "Audience: " + brief.audience,
      "Article form: " + brief.goal,
      "Trend angle to verify: " + brief.trend,
      "Why now (verify before using): " + (brief.whyNow.trim() || "Not supplied"),
      "Target length: approximately " + brief.targetWords + " words",
      "",
      "Requirements:",
      "- Keep the article subject-first and avoid regional or location-based framing unless scientifically necessary.",
      "- Research current, authoritative evidence before drafting.",
      "- Apply only the high-level editorial framework; keep all wording original.",
      "- Use author–date citations and at least five substantive references.",
      "- Verify every bibliographic field and format the reference list in exact APA 7 style.",
      "- State meaningful limitations and never invent evidence, quotations, DOIs or metadata.",
      "",
      "Selected framework rules:",
      ...activeAuthor.rules.map((rule) => "- " + rule),
      suppliedEvidence.length ? "" : "",
      suppliedEvidence.length ? "Evidence already supplied (verify it):" : "",
      ...suppliedEvidence.map((item) => "- " + item),
      suppliedReferences.length ? "" : "",
      suppliedReferences.length ? "References already supplied (verify them):" : "",
      ...suppliedReferences.map((item) => "- " + item.replace(/\*/g, "")),
    ]
      .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
      .join("\n")
      .trim();

    await navigator.clipboard.writeText(request);
    setRequestCopied(true);
    window.setTimeout(() => setRequestCopied(false), 1800);
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft.replace(/\*/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadDraft() {
    if (!draft) return;
    const safeTitle = selectedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    const body = draft
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        if (line.startsWith("# ")) return "<h1>" + inlineHtml(line.slice(2)) + "</h1>";
        if (line.startsWith("## ")) return "<h2>" + inlineHtml(line.slice(3)) + "</h2>";
        if (line.startsWith("- ")) return '<p class="reference">' + inlineHtml(line.slice(2)) + "</p>";
        return "<p>" + inlineHtml(line) + "</p>";
      })
      .join("");
    const html =
      '<!doctype html><html><head><meta charset="utf-8"><title>' +
      escapeHtml(selectedTitle) +
      '</title><style>body{font-family:Georgia,serif;max-width:760px;margin:48px auto;line-height:1.65;color:#17231d}h1{font-size:30px}h2{font:700 18px Arial,sans-serif;margin-top:28px}.reference{margin-left:36px;text-indent:-36px}em{font-style:italic}</style></head><body>' +
      body +
      "</body></html>";
    const url = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = (safeTitle || "popular-science-article") + ".doc";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const checks = [
    {
      label: "Evidence gate",
      pass: canDraft,
      detail: canDraft ? "Core evidence and at least two valid references are present" : "Complete all evidence fields and add two valid references",
    },
    {
      label: "APA 7 structure",
      pass: references.length >= 2 && allReferencesValid,
      detail: allReferencesValid ? "Required metadata is complete" : "Correct incomplete reference records",
    },
    {
      label: "Length",
      pass: Boolean(draft) && words >= lowerBound && words <= upperBound,
      detail: draft ? words + " words; target " + brief.targetWords + " (±15%)" : "Generate the draft to calculate length",
    },
    {
      label: "Author framework",
      pass: Boolean(draft),
      detail: activeAuthor.name + " · " + activeAuthor.framework,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-[#0b261d] text-white">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#b9d7c8]">
                Popular Science Desk
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Agro Popular Science Writer
              </h1>
            </div>
            <a
              href="https://www.zotero.org/styles/apa"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Download className="size-4" /> Download official APA 7 CSL
            </a>
          </div>
          <ol className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 text-xs sm:grid-cols-6 sm:text-sm">
            {["1 Subject", "2 Titles", "3 Author", "4 Evidence", "5 Draft", "6 APA 7"].map((step, index) => (
              <li
                key={step}
                className={"px-2 py-2.5 text-center " + (index === 1 ? "bg-[#d8f45b] font-semibold text-[#0b261d]" : "text-[#cbe0d5]")}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(390px,0.8fr)_minmax(0,1.2fr)] lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_50px_rgba(22,49,38,.08)]">
          <Tabs defaultValue="subject" className="gap-0">
            <TabsList variant="line" className="mx-5 mt-3 w-[calc(100%-2.5rem)] justify-start overflow-x-auto border-b border-border">
              <TabsTrigger value="subject">Subject</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="references">References <span className="rounded-full bg-[#e7efe9] px-1.5 text-xs">{references.length}</span></TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="space-y-5 p-5">
              <Field label="Scientific subject" hint="The organism, process, discovery or problem at the centre of the article.">
                <Input value={brief.subject} onChange={(event) => updateBrief("subject", event.target.value)} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Field">
                  <Select value={brief.field} onValueChange={(value) => updateBrief("field", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Agricultural entomology", "Acarology", "Crop protection", "Pollination", "Soil and plant health", "Agricultural technology", "Food systems"].map((field) => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Audience">
                  <Select value={brief.audience} onValueChange={(value) => updateBrief("audience", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["General science readers", "Students and researchers", "Policy and extension professionals", "Agricultural industry readers"].map((audience) => (
                        <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Article form">
                  <Select value={brief.goal} onValueChange={(value) => updateBrief("goal", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Popular science feature", "Research news article", "Mechanism explainer", "Emerging issue", "Science profile"].map((goal) => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Trend angle">
                  <Select value={brief.trend} onValueChange={(value) => updateBrief("trend", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Climate pressure", "Resistance evolution", "Biological control", "Biodiversity change", "New detection technology", "Food-system relevance", "Emerging research"].map((trend) => (
                        <SelectItem key={trend} value={trend}>{trend}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Why is this important now?" hint="Add the current research, event or trend signal. The app will not invent one.">
                <Textarea className="min-h-24" value={brief.whyNow} onChange={(event) => updateBrief("whyNow", event.target.value)} />
              </Field>

              <Field label={"Target length · " + brief.targetWords + " words"} hint="The review accepts a ±15% editorial range.">
                <Slider
                  value={[brief.targetWords]}
                  min={700}
                  max={1800}
                  step={100}
                  onValueChange={(value) => updateBrief("targetWords", value[0] || 1000)}
                  aria-label="Target article length"
                />
              </Field>

              <Button className="h-11 w-full bg-[#0f5a3f] text-white hover:bg-[#0b472f]" onClick={refreshTitles}>
                <Sparkles /> Suggest trend-aware titles
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                A title is treated as trend-based only when your “why now” statement is supported by a reference.
              </p>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-5 p-5">
              <EvidenceField
                label="Central verified finding"
                hint="What does the strongest source actually show?"
                value={evidence.finding}
                onChange={(value) => updateEvidence("finding", value)}
              />
              <EvidenceField
                label="Mechanism"
                hint="How or why does the process occur?"
                value={evidence.mechanism}
                onChange={(value) => updateEvidence("mechanism", value)}
              />
              <EvidenceField
                label="Scientific significance"
                hint="What changes in understanding, research or practice?"
                value={evidence.significance}
                onChange={(value) => updateEvidence("significance", value)}
              />
              <EvidenceField
                label="Limitations and uncertainty"
                hint="What does the evidence not establish?"
                value={evidence.uncertainty}
                onChange={(value) => updateEvidence("uncertainty", value)}
              />
              <EvidenceField
                label="Verified expert perspective (optional)"
                hint="Paste a checked quotation or a faithful attributed summary. No quotation will be invented."
                value={evidence.expertVoice}
                onChange={(value) => updateEvidence("expertVoice", value)}
              />
            </TabsContent>

            <TabsContent value="references" className="space-y-5 p-5">
              <div className="rounded-xl border border-[#bcd7cb] bg-[#edf7f1] p-4 text-sm leading-6 text-[#244c3c]">
                <strong>APA 7 input rule:</strong> enter each author as <span className="font-mono text-xs">Family name, Given names</span>, separated by semicolons. The formatter creates initials, punctuation, DOI form and journal/volume italics.
              </div>

              <Field label="Reference type">
                <Select value={referenceForm.kind} onValueChange={(value) => updateReference("kind", value as ReferenceKind)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">Journal article</SelectItem>
                    <SelectItem value="magazine">Magazine article</SelectItem>
                    <SelectItem value="webpage">Webpage</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Authors" hint="Example structure: Family, Given Middle; Family, Given">
                <Input value={referenceForm.authors} onChange={(event) => updateReference("authors", event.target.value)} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Year">
                  <Input placeholder="2026 or n.d." value={referenceForm.year} onChange={(event) => updateReference("year", event.target.value)} />
                </Field>
                {(referenceForm.kind === "magazine" || referenceForm.kind === "webpage") && (
                  <Field label="Month and day" hint="Example: September 3">
                    <Input value={referenceForm.fullDate} onChange={(event) => updateReference("fullDate", event.target.value)} />
                  </Field>
                )}
              </div>

              <Field label="Article, page or report title" hint="Enter sentence case. Use *asterisks* around scientific names that must be italicized.">
                <Input value={referenceForm.title} onChange={(event) => updateReference("title", event.target.value)} />
              </Field>

              {referenceForm.kind !== "report" && (
                <Field label={referenceForm.kind === "webpage" ? "Website name" : referenceForm.kind === "magazine" ? "Magazine title" : "Journal title"}>
                  <Input value={referenceForm.source} onChange={(event) => updateReference("source", event.target.value)} />
                </Field>
              )}

              {referenceForm.kind === "journal" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Volume"><Input value={referenceForm.volume} onChange={(event) => updateReference("volume", event.target.value)} /></Field>
                  <Field label="Issue"><Input value={referenceForm.issue} onChange={(event) => updateReference("issue", event.target.value)} /></Field>
                  <Field label="Pages/article no."><Input value={referenceForm.pages} onChange={(event) => updateReference("pages", event.target.value)} /></Field>
                </div>
              )}

              {referenceForm.kind === "magazine" && (
                <Field label="Pages (optional)"><Input value={referenceForm.pages} onChange={(event) => updateReference("pages", event.target.value)} /></Field>
              )}

              {referenceForm.kind === "report" && (
                <Field label="Publisher"><Input value={referenceForm.publisher} onChange={(event) => updateReference("publisher", event.target.value)} /></Field>
              )}

              <Field label="DOI or URL" hint="A bare DOI is automatically converted to https://doi.org/...">
                <Input value={referenceForm.doiOrUrl} onChange={(event) => updateReference("doiOrUrl", event.target.value)} />
              </Field>

              <div className="rounded-xl border border-dashed border-border bg-[#fbfcfb] p-4">
                <p className="eyebrow">Live APA 7 preview</p>
                <p className="mt-3 reference-preview"><InlineText text={formatApa({ ...referenceForm, id: "preview" })} /></p>
                {referenceFormErrors.length > 0 && (
                  <p className="mt-3 text-xs font-medium text-[#9a5610]">Still required: {referenceFormErrors.join(", ")}.</p>
                )}
              </div>

              <Button variant="outline" className="w-full" disabled={referenceFormErrors.length > 0} onClick={addReference}>
                <Plus /> Add formatted reference
              </Button>

              {sorted.length > 0 && (
                <div className="space-y-3 border-t border-border pt-5">
                  <p className="eyebrow">Reference list · alphabetical order</p>
                  {sorted.map((reference) => (
                    <div key={reference.id} className="group flex items-start gap-3 rounded-xl border border-border p-4">
                      <p className="reference-preview min-w-0 flex-1"><InlineText text={formatApa(reference)} /></p>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeReference(reference.id)} aria-label="Remove reference">
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_50px_rgba(22,49,38,.08)]">
          <Tabs defaultValue="titles" className="gap-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
              <TabsList variant="line">
                <TabsTrigger value="titles">Title desk</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="review">APA & editorial review</TabsTrigger>
              </TabsList>
              {draft && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyDraft}>
                    {copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadDraft}>
                    <Download /> Word file
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="titles" className="m-0 p-5 sm:p-7">
              <div className="mb-5">
                <p className="eyebrow">Subject-first title selection</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose the strongest story promise</h2>
              </div>

              <div className="grid gap-3">
                {suggestions.map((suggestion) => {
                  const author = authorById(suggestion.author);
                  const selected = selectedTitle === suggestion.title;
                  return (
                    <button
                      type="button"
                      key={suggestion.id}
                      onClick={() => chooseTitle(suggestion)}
                      className={"w-full rounded-xl border p-4 text-left transition " + (selected ? "border-[#1d704d] bg-[#edf7f1] shadow-sm" : "border-border hover:border-[#8fb8a5] hover:bg-[#f8faf8]")}
                    >
                      <div className="flex items-start gap-3">
                        <span className={"mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs " + (selected ? "border-[#1d704d] bg-[#1d704d] text-white" : "border-border")}>
                          {selected ? <Check className="size-3.5" /> : suggestion.id + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block font-serif text-lg leading-6 text-[#143526]">{suggestion.title}</strong>
                          <span className="mt-2 block text-sm leading-6 text-muted-foreground">{suggestion.rationale}</span>
                          <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2c644c]">
                            Best fit: {author.name}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 rounded-2xl bg-[#0b261d] p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9d7c8]">Recommended framework</p>
                    <h3 className="mt-1 text-xl font-semibold">{recommendation.name}</h3>
                    <p className="mt-1 text-sm text-[#cbe0d5]">{recommendation.framework}</p>
                  </div>
                  <Sparkles className="size-5 text-[#d8f45b]" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#d7e6de]">{recommendation.bestFor}</p>
              </div>

              <div className="mt-5">
                <Field label="Selected author framework" hint="All ten selected authors are available; you may override the automatic recommendation.">
                  <Select value={selectedAuthor} onValueChange={(value) => { setSelectedAuthor(value as AuthorId); setDraft(""); }}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUTHORS.map((author) => (
                        <SelectItem key={author.id} value={author.id}>{author.name} · {author.framework}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-4 rounded-xl border border-[#bcd7cb] bg-[#f5faf7] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[#184a35]">Strict framework rules</p>
                  <span className="rounded-full bg-[#d8f45b] px-2.5 py-1 text-xs font-bold text-[#163124]">ACTIVE</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#365a49]">
                  {activeAuthor.rules.map((rule) => (
                    <li key={rule} className="flex gap-2"><ChevronRight className="mt-1.5 size-3 shrink-0" />{rule}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-[#d4e5dc] pt-3 text-xs leading-5 text-[#587065]">
                  These rules enforce the analysed narrative architecture and cadence while keeping the wording original.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-[#bcd7cb] bg-[#edf7f1] p-4">
                <p className="font-semibold text-[#184a35]">ChatGPT Plus workflow</p>
                <p className="mt-1 text-sm leading-6 text-[#365a49]">
                  Copy the completed brief, paste it into ChatGPT Work or Codex, and the Agro Popular Science Writer skill will research and write the article in chat. No external API key is required.
                </p>
                <Button className="mt-4 h-11 w-full bg-[#0f5a3f] text-white hover:bg-[#0b472f]" onClick={copySkillRequest}>
                  {requestCopied ? <Check /> : <Clipboard />} {requestCopied ? "Skill request copied" : "Copy skill request for ChatGPT"}
                </Button>
              </div>

              <Button className="mt-3 h-11 w-full" variant="outline" disabled={!canDraft} onClick={generateDraft}>
                <BookOpenText /> Build manual evidence draft
              </Button>
              {!canDraft && (
                <p className="mt-3 text-center text-xs leading-5 text-[#8a5a1f]">
                  The manual draft requires all four evidence fields and at least two complete APA references. The ChatGPT skill request above does not.
                </p>
              )}
            </TabsContent>

            <TabsContent value="draft" className="m-0">
              {draft ? (
                <article className="article-sheet max-h-[calc(100vh-150px)] min-h-[760px] overflow-y-auto px-6 py-8 sm:px-10 lg:px-12">
                  {draft.split("\n").map((line, index) => {
                    if (!line) return null;
                    if (line.startsWith("# ")) return <h2 key={index} className="article-title"><InlineText text={line.slice(2)} /></h2>;
                    if (line.startsWith("## ")) return <h3 key={index} className="article-heading"><InlineText text={line.slice(3)} /></h3>;
                    if (line.startsWith("- ")) return <p key={index} className="source-line"><InlineText text={line.slice(2)} /></p>;
                    return <p key={index}><InlineText text={line} /></p>;
                  })}
                </article>
              ) : (
                <EmptyDraft />
              )}
            </TabsContent>

            <TabsContent value="review" className="m-0 p-6 sm:p-8">
              <div className="mb-6 flex items-start gap-4 rounded-2xl bg-[#0b261d] p-5 text-white">
                <FileCheck2 className="mt-0.5 size-6 shrink-0 text-[#d8f45b]" />
                <div>
                  <h2 className="text-lg font-semibold">Publication readiness</h2>
                  <p className="mt-1 text-sm leading-6 text-[#cbe0d5]">
                    Drafting is blocked until the evidence and APA metadata gates pass.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                {checks.map((check) => (
                  <div key={check.label} className="flex items-start gap-4 rounded-xl border border-border p-4">
                    <span className={"mt-0.5 grid size-8 shrink-0 place-items-center rounded-full " + (check.pass ? "bg-[#e6f6e8] text-[#17653d]" : "bg-[#fff1db] text-[#9a5610]")}>
                      {check.pass ? <Check className="size-4" /> : <TriangleAlert className="size-4" />}
                    </span>
                    <div>
                      <h3 className="font-semibold">{check.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-border bg-[#fbfcfb] p-5">
                <div className="flex items-center gap-2">
                  <LibraryBig className="size-4 text-[#22734f]" />
                  <h3 className="font-semibold">APA 7 formatting applied</h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>Author surname and initials, with an ampersand before the final author.</li>
                  <li>Year or full magazine/web date enclosed in parentheses.</li>
                  <li>Article titles in the title position with terminal punctuation.</li>
                  <li><em>Journal title and volume italicized</em>; issue number not italicized.</li>
                  <li>DOIs normalized to the https://doi.org/ format without a final period.</li>
                  <li>Reference list alphabetized and exported with a hanging indent.</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      {hint ? <span className="mb-2 mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span> : <span className="block h-2" />}
      {children}
    </label>
  );
}

function EvidenceField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea className="min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function EmptyDraft() {
  return (
    <div className="grid min-h-[760px] place-items-center bg-[#fffefb] p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e8f3ed] text-[#1d704d]">
          <BookOpenText className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">The draft begins with evidence</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Choose a title and author framework, complete the evidence fields, and add at least two valid APA references. The writing button will activate only when those requirements are met.
        </p>
      </div>
    </div>
  );
}
