import { PHRASE_REPLACEMENTS } from "../constants/writing-style";

const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

/**
 * Sanitizes LLM-generated content by replacing em-dashes, en-dashes in date
 * ranges, and banned AI-associated phrases with human alternatives.
 */
export function sanitizeGeneratedContent(content: string): string {
  let result = content;

  // Replace em-dash (—) with comma + space
  result = result.replaceAll(EM_DASH, ", ");

  // Replace en-dash (–) in date ranges with hyphen (e.g., "May 2021 – Present", "2021 – 2023")
  const monthDateRegex = new RegExp(
    `(\\w+\\s+\\d{4})\\s*${EN_DASH}\\s*(\\w+|\\d{4})`,
    "g",
  );
  const yearRangeRegex = new RegExp(
    `(\\d{4})\\s*${EN_DASH}\\s*(\\d{4})`,
    "g",
  );
  result = result.replace(monthDateRegex, "$1 - $2").replace(yearRangeRegex, "$1 - $2");

  // Apply phrase replacements (order: longest first, case-insensitive)
  for (const [banned, replacement] of PHRASE_REPLACEMENTS) {
    const regex = new RegExp(escapeRegex(banned), "gi");
    result = result.replace(regex, (match) =>
      preserveCase(match, replacement),
    );
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0]?.toUpperCase()) {
    return replacement[0]?.toUpperCase() + replacement.slice(1).toLowerCase();
  }
  return replacement.toLowerCase();
}
