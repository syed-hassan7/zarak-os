import { ASSISTANT_KNOWLEDGE } from "./knowledge.generated";
import { searchKnowledge } from "./search";
import type { AssistantAnswer, AssistantKnowledgeEntry } from "./types";

const UNKNOWN_ANSWER: AssistantAnswer = {
  status: "unknown",
  title: "I don't have verified data for that yet.",
  body:
    "I only answer from Zarak's verified portfolio knowledge base. Try CV.app, LinkedIn.app, or Contact.app for the most reliable source.",
  sources: [],
  actions: ["open-cv", "open-linkedin", "open-contact"],
  matchedEntryIds: [],
};

function conciseBody(entry: AssistantKnowledgeEntry): string {
  return entry.body.trim();
}

export function answerQuestion(query: string): AssistantAnswer {
  const matches = searchKnowledge(query, ASSISTANT_KNOWLEDGE, 3);
  const best = matches[0];

  if (!best || best.score < 10) {
    return UNKNOWN_ANSWER;
  }

  return {
    status: "answered",
    title: best.entry.title,
    body: conciseBody(best.entry),
    sources: best.entry.sources ?? [],
    actions: best.entry.actions ?? [],
    matchedEntryIds: matches.map((match) => match.entry.id),
    confidence: best.entry.confidence,
  };
}

export const STARTER_QUESTIONS = [
  "Why should we hire Zarak?",
  "What security and GRC experience does Zarak have?",
  "What customer-facing experience does Zarak have?",
  "What has Zarak built?",
  "What is VenderScope?",
  "What is ContraAI?",
  "Where can I view his CV?",
  "How can I contact him?",
] as const;
