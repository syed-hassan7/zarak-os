import type { AssistantActionId } from "./types";

export interface AssistantActionContext {
  openApp?: (appId: string) => void;
  copyText?: (value: string) => Promise<void> | void;
}

export const ASSISTANT_EXTERNAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/zarak-hassan7/",
  github: "https://github.com/darkyzowo",
  venderscope: "https://venderscope.vercel.app/",
  portfolio: "https://zarak-os.vercel.app/",
  cv: "/Syed_Zarak_Hassan_CV_2026.pdf",
};

export const ASSISTANT_EMAIL = "syedzrk1000@gmail.com";

export const ACTION_LABELS: Record<AssistantActionId, string> = {
  "open-cv": "Open CV.app",
  "open-linkedin": "Open LinkedIn",
  "open-contact": "Open Contact",
  "open-venderscope": "Open VenderScope",
  "open-github": "Open GitHub",
  "copy-email": "Copy Email",
};

export async function runAssistantAction(actionId: string, context: AssistantActionContext = {}) {
  switch (actionId as AssistantActionId) {
    case "open-cv":
      context.openApp?.("cv");
      return;
    case "open-linkedin":
      context.openApp?.("linkedin");
      return;
    case "open-contact":
      context.openApp?.("contact");
      return;
    case "open-venderscope":
      context.openApp?.("venderscope");
      return;
    case "open-github":
      window.open(ASSISTANT_EXTERNAL_LINKS.github, "_blank", "noopener,noreferrer");
      return;
    case "copy-email":
      if (context.copyText) {
        await context.copyText(ASSISTANT_EMAIL);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(ASSISTANT_EMAIL);
      }
      return;
    default:
      return;
  }
}
