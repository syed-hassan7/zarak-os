import knowledgeEmbeddings from "./knowledge.embeddings.generated.json";

// Server-side only. This file (and the ~220KB embeddings JSON it imports)
// must never be reachable from client bundles — see the header comment in
// scripts/build-assistant-knowledge.mjs and docs/RAG_ARCHITECTURE.md. Only
// api/ask.ts (a Vercel Edge Function, never bundled into the client app)
// imports this module.

export interface EntrySimilarity {
  id: string;
  similarity: number;
}

const EMBEDDING_MODEL_ID = knowledgeEmbeddings.model;
const EMBEDDING_DIMENSIONS = knowledgeEmbeddings.dimensions;
const EMBED_QUERY_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL_ID}:embedContent`;

// Insertion order preserved; iterated in full on every query (23 entries
// today — trivial cost either way, no need for anything fancier at this
// corpus size).
const embeddingLookup: Array<{ id: string; vector: number[] }> = (
  knowledgeEmbeddings.entries as Array<{ id: string; vector: number[] }>
).map((entry) => ({ id: entry.id, vector: entry.vector }));

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Embeds a single visitor question with Gemini's gemini-embedding-001
 * (taskType RETRIEVAL_QUERY — asymmetric with the RETRIEVAL_DOCUMENT
 * embeddings baked at build time, which measurably improves match quality
 * over symmetric embedding; confirmed live: 0.897 cosine similarity for a
 * genuinely matching doc/query pair vs ~0.42-0.59 for unrelated pairs).
 *
 * Returns null on ANY failure (network, timeout, malformed response,
 * quota) so the caller can degrade to keyword-only search rather than
 * fail the whole request — semantic search is an enhancement layer, not
 * a new single point of failure.
 */
export async function embedQuery(
  question: string,
  apiKey: string,
  timeoutMs: number,
): Promise<number[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${EMBED_QUERY_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL_ID}`,
        content: { parts: [{ text: question }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const values = data?.embedding?.values;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) return null;
    return values as number[];
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Ranks every knowledge entry by cosine similarity to an already-embedded query. */
export function semanticRank(queryVector: number[]): EntrySimilarity[] {
  return embeddingLookup
    .map(({ id, vector }) => ({ id, similarity: cosineSimilarity(queryVector, vector) }))
    .sort((a, b) => b.similarity - a.similarity);
}
