import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Runs `npm audit --json` at build time and bakes the real severity counts
// into a small generated module so the audit.sys app can display accurate,
// as-of-last-deploy dependency health with zero runtime cost or network call.
// Mirrors the pattern in scripts/build-assistant-knowledge.mjs.

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "src", "audit");
const OUT_FILE = join(OUT_DIR, "depHealth.generated.ts");

let summary = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
let ok = true;

try {
  // npm audit exits non-zero when vulnerabilities are found — that's expected,
  // capture stdout regardless rather than treating it as a hard failure.
  const raw = execSync("npm audit --json", { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const parsed = JSON.parse(raw);
  if (parsed?.metadata?.vulnerabilities) {
    summary = parsed.metadata.vulnerabilities;
  }
} catch (error) {
  const stdout = error?.stdout?.toString();
  if (stdout) {
    try {
      const parsed = JSON.parse(stdout);
      if (parsed?.metadata?.vulnerabilities) {
        summary = parsed.metadata.vulnerabilities;
      }
    } catch {
      ok = false;
    }
  } else {
    ok = false;
  }
}

mkdirSync(OUT_DIR, { recursive: true });

const generated = `/* eslint-disable */
/**
 * AUTO-GENERATED FILE. Do not edit directly.
 * Regenerated on every \`npm run build\` from a live \`npm audit --json\` run.
 */
export interface DependencyHealthSummary {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
  total: number;
}

export const DEPENDENCY_HEALTH: DependencyHealthSummary = ${JSON.stringify(summary, null, 2)};
export const DEPENDENCY_HEALTH_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};
export const DEPENDENCY_HEALTH_SCAN_OK = ${ok};
`;

writeFileSync(OUT_FILE, generated);
console.log(`Generated dependency health snapshot -> ${OUT_FILE} (total: ${summary.total})`);
