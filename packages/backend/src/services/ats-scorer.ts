import type { AtsScoreResult } from "@cvrx/shared";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "must", "it", "its", "you", "your", "we", "our", "they", "their",
  "he", "she", "his", "her", "this", "that", "these", "those", "what",
  "which", "who", "whom", "how", "when", "where", "why", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "about", "above", "after", "again", "also", "any", "because", "before",
  "between", "during", "into", "over", "through", "under", "until",
  "while", "able", "across", "along", "already", "among", "around",
  "etc", "like", "including", "well", "new", "get", "got", "make",
  "made", "use", "used", "using", "work", "working", "role", "team",
  "looking", "join", "help", "strong", "within", "upon", "per",
]);

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.split(/[\s,;:()\[\]{}"'!?./\-\n\r\t]+/);
  const filtered = words.filter(
    (w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w),
  );
  return [...new Set(filtered)];
}

export function calculateAtsScore(
  resumeContent: string,
  jobDescription: string,
): AtsScoreResult {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeLower = resumeContent.toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of jdKeywords) {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const totalKeywords = jdKeywords.length;
  const score =
    totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;

  return { score, matchedKeywords, missingKeywords, totalKeywords };
}
