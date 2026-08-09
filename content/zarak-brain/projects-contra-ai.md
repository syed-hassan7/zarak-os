---
id: contra-ai
title: ContraAI
tags: [project, contraai, contracts, ai, nextjs, claude, compliance, dpa]
aliases: [what is contra ai, contract review, ai contract review]
sources: [customer-cv, portfolio]
confidence: verified
actions: [open-contact]
---

ContraAI is an internal Thrive Learning tool: an AI-powered contract review engine built with Next.js 15 and the Claude API, analyzing legal documents against a configurable company playbook. It came from a real workflow gap around contract handling and review, and reduced procurement approval cycles by 70% by automating detection of high-risk clauses and giving legal teams instant negotiation guidance.

Notable design choices:
- Deterministic risk scoring that tiers contracts from Acceptable to Critical based on playbook deviations, not model variance — reproducible results, not LLM guesswork.
- A full immutable audit trail for every sensitive action (clause reviews, user invites) to meet internal GRC logging requirements.
- A DPA-specific intelligence module that detects subprocessor gaps and flags missing required clauses automatically.
- Role-based governance (Viewer, Legal, Admin) so sensitive contract data stays restricted to authorized personnel.
