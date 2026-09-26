import { searchKnowledge } from "./search";
import { semanticRank } from "./semanticSearch";
import type { AssistantKnowledgeEntry, AssistantSearchMatch } from "./types";

export interface HybridMatch {
  entry: AssistantKnowledgeEntry;
  hybridScore: number;
  keywordScore: number;
  semanticSimilarity: number | null;
}

export interface HybridSearchResult {
  matches: HybridMatch[];
  /** True if this question is relevant enough to spend a Gemini generate call on. */
  passesRelevanceGate: boolean;
}

// Weights favor semantic signal (conceptual/paraphrased questions — the
// original problem this module exists to fix) while keyword score still
// meaningfully contributes (protects exact-name/acronym queries an
// embedding can underweight, e.g. "VenderScope" or "ISO 27001").
const SEMANTIC_WEIGHT = 0.65;
const KEYWORD_WEIGHT = 0.35;
// A keyword score at/above this normalizes to a full 1.0 keyword component.
// Calibrated against search.ts's own scoring: a title hit is +35, an alias
// hit +30 — either alone already saturates this cap.
const KEYWORD_NORMALIZATION_CAP = 30;

// Relevance gate: skip the Gemini generate call entirely (saves quota +
// latency) when nothing in the knowledge base is actually relevant to the
// question. Calibrated live against the real 23-entry corpus on 2026-09-26
// (see docs/RAG_ARCHITECTURE.md for the full readout):
//   on-topic, paraphrased/conceptual questions -> best cosine 0.72-0.78
//   off-topic questions (recipes, sports, nonsense) -> best cosine 0.43-0.51
// 0.62 sits with >0.10 margin on both sides of that gap.
const SEMANTIC_RELEVANCE_THRESHOLD = 0.62;
// Safety net for the embedding call failing/timing out, or a rare case the
// embedding underweights: a strong literal alias/title hit is trusted even
// without semantic confirmation (mirrors this module's old all-keyword gate).
const KEYWORD_STRONG_MATCH_THRESHOLD = 20;

/**
 * Merges keyword search (search.ts) with semantic similarity ranking
 * (semanticSearch.ts) into one ranked candidate list, plus a pass/fail
 * relevance gate deciding whether the question is worth sending to Gemini
 * at all.
 *
 * `queryVector` is null when embedQuery() failed (network/timeout/quota) —
 * in that case this degrades to pure keyword ranking, identical in
 * behavior to the pre-RAG search.ts-only pipeline, so a Gemini embedding
 * outage never breaks the assistant, only narrows it back to keyword
 * matching for that one request.
 */
export function hybridSearch(
  question: string,
  entries: AssistantKnowledgeEntry[],
  queryVector: number[] | null,
  limit = 8,
): HybridSearchResult {
  const keywordMatches: AssistantSearchMatch[] = searchKnowledge(question, entries, entries.length);
  const keywordById = new Map(keywordMatches.map((m) => [m.entry.id, m.score]));
  const semanticById = queryVector
    ? new Map(semanticRank(queryVector).map((s) => [s.id, s.similarity]))
    : new Map<string, number>();

  const candidateIds = new Set<string>([...keywordById.keys(), ...semanticById.keys()]);
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  const scored: HybridMatch[] = Array.from(candidateIds)
    .map((id): HybridMatch | null => {
      const entry = entriesById.get(id);
      if (!entry) return null;

      const keywordScore = keywordById.get(id) ?? 0;
      const semanticSimilarity = semanticById.has(id) ? semanticById.get(id)! : null;
      const normalizedKeyword = Math.min(keywordScore / KEYWORD_NORMALIZATION_CAP, 1);

      const hybridScore = queryVector
        ? normalizedKeyword * KEYWORD_WEIGHT + (semanticSimilarity ?? 0) * SEMANTIC_WEIGHT
        : normalizedKeyword;

      return { entry, hybridScore, keywordScore, semanticSimilarity };
    })
    .filter((match): match is HybridMatch => match !== null)
    .sort((a, b) => b.hybridScore - a.hybridScore);

  const bestSemantic = scored.reduce((max, m) => Math.max(max, m.semanticSimilarity ?? 0), 0);
  const bestKeyword = scored.reduce((max, m) => Math.max(max, m.keywordScore), 0);

  const passesRelevanceGate = queryVector
    ? bestSemantic >= SEMANTIC_RELEVANCE_THRESHOLD || bestKeyword >= KEYWORD_STRONG_MATCH_THRESHOLD
    : bestKeyword > 0;

  return { matches: scored.slice(0, limit), passesRelevanceGate };
}
