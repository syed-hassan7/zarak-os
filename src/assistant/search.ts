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
      }

      return { entry, score, reasons };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}
