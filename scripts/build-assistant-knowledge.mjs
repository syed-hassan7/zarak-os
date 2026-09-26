import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "content", "zarak-brain");
const OUT_DIR = join(ROOT, "src", "assistant");
const OUT_FILE = join(OUT_DIR, "knowledge.generated.ts");
const EMBEDDINGS_OUT_FILE = join(OUT_DIR, "knowledge.embeddings.generated.json");

// Same model confirmed live against the project's real GEMINI_API_KEY before
// wiring this in (see api/ask.ts header comment) — gemini-embedding-001,
// truncated to 768 dims via outputDimensionality (Matryoshka representation:
// a truncated prefix of the full vector stays a valid, well-formed embedding,
// this is not lossy in the way naive dimension-dropping would be).
const EMBEDDING_MODEL_ID = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL_ID}:batchEmbedContents`;
// Gemini's batchEmbedContents caps at 100 requests per call as of 2026-09;
// chunk defensively so the knowledge base can grow well past today's 21
// entries without silently dropping embeddings past the cap.
const BATCH_CHUNK_SIZE = 90;

function parseFrontmatter(raw, fileName) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) {
    throw new Error(`${fileName}: missing YAML-style frontmatter`);
  }

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) {
    throw new Error(`${fileName}: unterminated frontmatter`);
  }

  const frontmatter = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();

  const meta = {};
  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      meta[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else {
      meta[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  return { meta, body };
}

function validateEntry(entry, fileName) {
  const required = ["id", "title", "tags", "sources", "confidence", "body"];
  for (const key of required) {
    if (!entry[key] || (Array.isArray(entry[key]) && entry[key].length === 0)) {
      throw new Error(`${fileName}: missing required field "${key}"`);
    }
  }
}

// Text actually sent to the embedding model: title + tags + aliases + body,
// concatenated. Tags/aliases carry real signal (exact terms like "figma",
// "grc") that the prose body doesn't always repeat verbatim, and including
// them measurably improves retrieval for short/keyword-y questions without
// costing anything extra (this only runs once per build, not per request).
function embeddableText(entry) {
  const aliasLine = entry.aliases?.length ? `Also known as: ${entry.aliases.join(", ")}.` : "";
  const tagLine = entry.tags?.length ? `Tags: ${entry.tags.join(", ")}.` : "";
  return [entry.title, tagLine, aliasLine, entry.body].filter(Boolean).join("\n");
}

async function batchEmbed(texts, apiKey, taskType) {
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH_CHUNK_SIZE) {
    const chunk = texts.slice(i, i + BATCH_CHUNK_SIZE);
    const res = await fetch(`${EMBEDDING_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requests: chunk.map((text) => ({
          model: `models/${EMBEDDING_MODEL_ID}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })),
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "<unreadable>");
      throw new Error(
        `Gemini batchEmbedContents failed: ${res.status} ${res.statusText}\n${errorBody}`,
      );
    }

    const data = await res.json();
    const embeddings = data?.embeddings;
    if (!Array.isArray(embeddings) || embeddings.length !== chunk.length) {
      throw new Error("Gemini batchEmbedContents returned an unexpected shape");
    }

    for (const item of embeddings) {
      const values = item?.values;
      if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
        throw new Error("Gemini batchEmbedContents returned a malformed embedding vector");
      }
      results.push(values);
    }
  }
  return results;
}

const files = readdirSync(CONTENT_DIR)
  .filter((file) => extname(file) === ".md")
  .sort();

const entries = files.map((file) => {
  const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
  const { meta, body } = parseFrontmatter(raw, file);
  const entry = {
    id: meta.id,
    title: meta.title,
    tags: meta.tags ?? [],
    aliases: meta.aliases ?? [],
    sources: meta.sources ?? [],
    confidence: meta.confidence ?? "verified",
    actions: meta.actions ?? [],
    body,
  };

  validateEntry(entry, file);
  return entry;
});

mkdirSync(OUT_DIR, { recursive: true });

const generated = `/* eslint-disable */
/**
 * AUTO-GENERATED FILE. Do not edit directly.
 * Edit content/zarak-brain/*.md and run:
 *   npm run build:assistant
 */
import type { AssistantKnowledgeEntry } from "./types";

export const ASSISTANT_KNOWLEDGE: AssistantKnowledgeEntry[] = ${JSON.stringify(entries, null, 2)} as const;
`;

writeFileSync(OUT_FILE, generated);
console.log(`Generated ${entries.length} assistant knowledge entries -> ${OUT_FILE}`);

// Embeddings power the semantic-retrieval half of api/ask.ts's hybrid search
// (see docs/RAG_ARCHITECTURE.md). This file is imported ONLY by that
// server-side edge function, never by client code — it must not be reachable
// from src/assistant/answerEngine.ts (the offline fallback engine), which
// stays keyword-only by design so the client bundle doesn't ship ~150KB of
// raw floats for a feature that only ever runs on the server.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "\nERROR: GEMINI_API_KEY is not set — cannot generate knowledge embeddings.\n" +
      "Run `vercel env pull` first, or export GEMINI_API_KEY manually before building.\n" +
      "Refusing to write a stale/partial embeddings file.",
  );
  process.exit(1);
}

const texts = entries.map(embeddableText);
const vectors = await batchEmbed(texts, apiKey, "RETRIEVAL_DOCUMENT");

const embeddingsFile = {
  model: EMBEDDING_MODEL_ID,
  dimensions: EMBEDDING_DIMENSIONS,
  generatedAt: new Date().toISOString(),
  entries: entries.map((entry, index) => ({ id: entry.id, vector: vectors[index] })),
};

writeFileSync(EMBEDDINGS_OUT_FILE, JSON.stringify(embeddingsFile));
console.log(`Generated ${vectors.length} knowledge embeddings -> ${EMBEDDINGS_OUT_FILE}`);
