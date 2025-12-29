import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// Initialize the matcher once
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  censored: string;
  matches: string[];
}

/**
 * Check text for profanity and return censored version
 * @param text - The text to check
 * @returns Object with profanity status and censored text
 */
export function checkProfanity(text: string): ProfanityCheckResult {
  if (!text || text.trim().length === 0) {
    return {
      hasProfanity: false,
      censored: text,
      matches: [],
    };
  }

  const matches = matcher.getAllMatches(text);
  const hasProfanity = matches.length > 0;

  // Censor profanity by replacing with asterisks
  let censored = text;
  if (hasProfanity) {
    // Sort matches in reverse order to replace from end to start
    const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

    for (const match of sortedMatches) {
      const start = match.startIndex;
      const end = match.endIndex;
      const replacement = "*".repeat(end - start);
      censored = censored.substring(0, start) + replacement + censored.substring(end);
    }
  }

  return {
    hasProfanity,
    censored,
    matches: matches.map((m) => text.substring(m.startIndex, m.endIndex)),
  };
}

/**
 * Validate review text for profanity
 * @param text - Review text to validate
 * @returns Censored text (safe to store)
 */
export function sanitizeReview(text: string): string {
  const result = checkProfanity(text);
  return result.censored;
}
