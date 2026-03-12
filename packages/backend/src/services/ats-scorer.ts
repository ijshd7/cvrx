import type { AtsScoreResult } from "@cvrx/shared";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "need",
  "must",
  "it",
  "its",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "he",
  "she",
  "his",
  "her",
  "this",
  "that",
  "these",
  "those",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "about",
  "above",
  "after",
  "again",
  "also",
  "any",
  "because",
  "before",
  "between",
  "during",
  "into",
  "over",
  "through",
  "under",
  "until",
  "while",
  "able",
  "across",
  "along",
  "already",
  "among",
  "around",
  "etc",
  "like",
  "including",
  "well",
  "new",
  "get",
  "got",
  "make",
  "made",
  "use",
  "used",
  "using",
  "work",
  "working",
  "role",
  "team",
  "looking",
  "join",
  "help",
  "strong",
  "within",
  "upon",
  "per",
]);

// Synonym groups: first entry is the canonical form shown to user
const SKILL_SYNONYMS: string[][] = [
  ["javascript", "js"],
  ["typescript", "ts"],
  ["react", "reactjs", "react.js"],
  ["node.js", "nodejs", "node"],
  ["next.js", "nextjs"],
  ["vue.js", "vuejs", "vue"],
  ["angular", "angularjs"],
  ["python", "py"],
  ["golang", "go"],
  ["postgresql", "postgres", "psql"],
  ["mongodb", "mongo"],
  ["amazon web services", "aws"],
  ["google cloud platform", "gcp", "google cloud"],
  ["microsoft azure", "azure"],
  ["kubernetes", "k8s"],
  ["docker", "containerization"],
  ["ci/cd", "continuous integration", "continuous deployment", "cicd"],
  ["machine learning", "ml"],
  ["artificial intelligence", "ai"],
  ["natural language processing", "nlp"],
  ["rest api", "restful api", "restful apis", "rest apis"],
  ["graphql", "graph ql"],
  ["sql", "structured query language"],
  ["nosql", "no-sql"],
  ["html", "html5"],
  ["css", "css3"],
];

// Build a lookup map: term -> all synonyms in its group
const synonymMap = new Map<string, string[]>();
for (const group of SKILL_SYNONYMS) {
  for (const term of group) {
    synonymMap.set(term.toLowerCase(), group.map((g) => g.toLowerCase()));
  }
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,;:()\[\]{}"'!?\n\r\t]+/).filter(Boolean);
}

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.split(/[\s,;:()\[\]{}"'!?./\-\n\r\t]+/);
  const filtered = words.filter(
    (w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w),
  );
  return [...new Set(filtered)];
}

export function extractPhrases(text: string): string[] {
  const tokens = tokenize(text);
  const phrases = new Set<string>();

  // Bigrams
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    // Keep phrase if at least one word is not a stop word
    if (!STOP_WORDS.has(tokens[i]) || !STOP_WORDS.has(tokens[i + 1])) {
      if (tokens[i].length >= 2 && tokens[i + 1].length >= 2) {
        phrases.add(bigram);
      }
    }
  }

  // Trigrams
  for (let i = 0; i < tokens.length - 2; i++) {
    const nonStopCount = [tokens[i], tokens[i + 1], tokens[i + 2]].filter(
      (t) => !STOP_WORDS.has(t),
    ).length;
    if (nonStopCount >= 2) {
      const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
      phrases.add(trigram);
    }
  }

  return [...phrases];
}

function checkMatch(term: string, resumeLower: string): boolean {
  if (resumeLower.includes(term)) return true;

  // Check synonyms
  const synonyms = synonymMap.get(term);
  if (synonyms) {
    return synonyms.some((syn) => resumeLower.includes(syn));
  }

  return false;
}

export function calculateAtsScore(
  resumeContent: string,
  jobDescription: string,
): AtsScoreResult {
  const resumeLower = resumeContent.toLowerCase();

  // Extract single keywords
  const jdKeywords = extractKeywords(jobDescription);

  // Extract phrases from JD
  const jdPhrases = extractPhrases(jobDescription);

  // Score phrases first (they're more meaningful)
  const matchedPhrases: string[] = [];
  const missingPhrases: string[] = [];
  const phraseMatchedWords = new Set<string>();

  for (const phrase of jdPhrases) {
    if (checkMatch(phrase, resumeLower)) {
      matchedPhrases.push(phrase);
      // Track which words are covered by matched phrases
      for (const word of phrase.split(/\s+/)) {
        phraseMatchedWords.add(word);
      }
    } else {
      // Only report missing phrases where at least one word is significant
      const words = phrase.split(/\s+/);
      const significantWords = words.filter(
        (w) => !STOP_WORDS.has(w) && w.length >= 3,
      );
      if (significantWords.length >= 1) {
        missingPhrases.push(phrase);
      }
    }
  }

  // Score keywords, but skip words already covered by phrase matches
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of jdKeywords) {
    if (phraseMatchedWords.has(keyword)) {
      matchedKeywords.push(keyword);
      continue;
    }
    if (checkMatch(keyword, resumeLower)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  // Weighted scoring: phrases count 2x, keywords count 1x
  const phraseWeight = 2;
  const keywordWeight = 1;

  const totalWeight =
    jdPhrases.length * phraseWeight + jdKeywords.length * keywordWeight;
  const matchedWeight =
    matchedPhrases.length * phraseWeight +
    matchedKeywords.length * keywordWeight;

  const score =
    totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  const totalKeywords = jdKeywords.length + jdPhrases.length;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords,
    matchedPhrases,
    missingPhrases,
  };
}
