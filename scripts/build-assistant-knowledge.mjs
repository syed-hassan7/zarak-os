import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "content", "zarak-brain");
const OUT_DIR = join(ROOT, "src", "assistant");
const OUT_FILE = join(OUT_DIR, "knowledge.generated.ts");

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
