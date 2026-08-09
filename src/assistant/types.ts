export type AssistantSource =
  | "cv"
  | "customer-cv"
  | "linkedin"
  | "portfolio"
  | "projects";

export type AssistantActionId =
  | "open-cv"
  | "open-linkedin"
  | "open-contact"
  | "open-venderscope"
  | "open-github"
  | "open-claude-harness"
  | "open-red-team-desk"
  | "copy-email";

export type AssistantConfidence = "verified" | "partial" | "unknown";

export interface AssistantKnowledgeEntry {
  id: string;
  title: string;
  tags: string[];
  aliases?: string[];
  sources: AssistantSource[] | string[];
  confidence: AssistantConfidence | string;
  actions?: AssistantActionId[] | string[];
  body: string;
}

export interface AssistantAnswer {
  status: "answered" | "unknown";
  title: string;
  body: string;
  sources: string[];
  actions: string[];
  matchedEntryIds: string[];
  confidence?: AssistantConfidence | string;
}

export interface AssistantSearchMatch {
  entry: AssistantKnowledgeEntry;
  score: number;
  reasons: string[];
}
