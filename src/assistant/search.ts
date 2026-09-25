import type { AssistantKnowledgeEntry, AssistantSearchMatch } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "can", "do", "does", "for", "from",
  "has", "have", "he", "his", "how", "i", "in", "is", "it", "me", "of", "on",
  "or", "should", "that", "the", "this", "to", "what", "when", "where", "who",
  "why", "with", "you", "your", "zarak", "syed"
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function includesPhrase(source: string, query: string): boolean {
  return normalize(source).includes(normalize(query));
}

// Small edit-distance check so a typo ("linkedln", "grammer", "expereince")
// doesn't silently fall through to zero matches and skip the LLM entirely.
// Only applied to tokens of 4+ chars so short words don't fuzzy-match noise.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyMatches(token: string, candidate: string): boolean {
  if (token.length < 4 || candidate.length < 4) return false;
  const maxDistance = token.length >= 7 ? 2 : 1;
  return levenshtein(token, candidate) <= maxDistance;
}

export function searchKnowledge(
  query: string,
  entries: AssistantKnowledgeEntry[],
  limit = 5
): AssistantSearchMatch[] {
  const normalizedQuery = normalize(query);
  const queryTokens = tokens(query);

  if (!normalizedQuery || queryTokens.length === 0) return [];

  const matches = entries
    .map((entry): AssistantSearchMatch => {
      let score = 0;
      const reasons: string[] = [];

      const title = entry.title ?? "";
      const tags = entry.tags ?? [];
      const aliases = entry.aliases ?? [];
      const body = entry.body ?? "";
      const titleWords = normalize(title).split(" ");
      const tagWords = tags.flatMap((tag) => normalize(tag).split(/[\s-]+/));

      if (includesPhrase(title, normalizedQuery)) {
        score += 35;
        reasons.push("title");
      }

      for (const alias of aliases) {
        if (includesPhrase(alias, normalizedQuery) || includesPhrase(normalizedQuery, alias)) {
          score += 30;
          reasons.push("alias");
          break;
        }
      }

      for (const token of queryTokens) {
        if (tags.some((tag) => normalize(tag).includes(token))) {
          score += 12;
          reasons.push(`tag:${token}`);
        }

        if (normalize(title).includes(token)) {
          score += 8;
          reasons.push(`title:${token}`);
        }

        if (normalize(body).includes(token)) {
          score += 3;
          reasons.push(`body:${token}`);
        }

        // Fuzzy fallback: only checked when the exact token found nothing,
        // so a clean match never gets diluted by a weaker fuzzy score.
        const hadExactHit = reasons[reasons.length - 1]?.endsWith(`:${token}`);
        if (!hadExactHit) {
          if (tagWords.some((word) => fuzzyMatches(token, word))) {
            score += 9;
            reasons.push(`fuzzy-tag:${token}`);
          } else if (titleWords.some((word) => fuzzyMatches(token, word))) {
            score += 6;
            reasons.push(`fuzzy-title:${token}`);
          }
        }
      }

      return { entry, score, reasons };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}
