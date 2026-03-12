/**
 * Banned AI-associated phrases used in prompts and post-processing sanitization.
 * Keep in sync with PHRASE_REPLACEMENTS for sanitizer behavior.
 */
export const BANNED_PHRASES = [
  "Results-driven",
  "Proven track record",
  "Leveraging",
  "Spearheaded",
  "Cutting-edge",
  "Synergy",
  "Delve",
  "Tapestry",
  "Landscape",
  "Robust",
  "Holistic",
  "Pivotal",
  "Harness",
  "Foster",
  "Facilitate",
  "Navigate",
  "Streamline",
  "Elevate",
  "Empower",
  "Passionate",
  "Dynamic",
  "Innovative",
  "Leverage",
] as const;

/**
 * Phrase replacements for post-processing. Order matters: longer phrases first
 * to avoid partial matches (e.g., "Passionate about" before "Passionate").
 */
export const PHRASE_REPLACEMENTS: [string, string][] = [
  ["Passionate about", "Interested in"],
  ["Proven track record", "Track record"],
  ["Results-driven", "Focused on results"],
  ["Cutting-edge", "Modern"],
  ["Leveraging", "Using"],
  ["Leverage", "Use"],
  ["Spearheaded", "Led"],
  ["Streamline", "Simplify"],
  ["Facilitate", "Enable"],
  ["Empower", "Enable"],
  ["Elevate", "Improve"],
  ["Harness", "Use"],
  ["Foster", "Build"],
  ["Navigate", "Handle"],
  ["Holistic", "Comprehensive"],
  ["Robust", "Strong"],
  ["Pivotal", "Key"],
  ["Synergy", "Collaboration"],
  ["Delve", "Explore"],
  ["Tapestry", "Range"],
  ["Landscape", "Field"],
  ["Passionate", "Interested"],
  ["Dynamic", "Active"],
  ["Innovative", "Creative"],
];
