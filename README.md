# ZARAK_OS // KERNEL_V2.7

ZARAK_OS is a high-fidelity cyber-noir portfolio operating system for **Syed Zarak Hassan**. It combines a custom desktop shell, a real LLM-backed portfolio assistant, a public guestbook, and a full 3D MacBook scene to present experience, projects, and security/GRC work as a product surface rather than a static website.

![ZARAK_OS Preview](docs/preview.png)

## Overview

The project is split between two presentation layers:

- **3D environment**: an immersive 3D MacBook model built with Three.js / React Three Fiber — animated GIF hinge sticker (Nyan Cat), backlit keyboard with custom canvas-painted icon row, and a projected OS shell screen.
- **OS shell**: the flat desktop UI rendered on top, including windows, dock, Spotlight, Mission Control, Aegis-M, and desktop backdrop controls.

A dedicated touch-first mobile shell replaces the 3D scene and desktop chrome entirely on phones/tablets — no desktop-only surface (window manager, custom cursor, Aegis-M mascot) is ever rendered there.

The result is a portfolio that behaves more like a small operating system than a brochure site.

## Current Features

### Shell & desktop
- **3D MacBook scene**: custom Three.js model with a backlit keyboard (14-key fn row, per-key emissive glow), hinge brand strip, animated Nyan Cat GIF sticker, and a screen that projects the live OS shell.
- **Custom OS shell**: draggable, minimizable, resizable, stackable windows with dock, menu bar, Spotlight, and Mission Control flows.
- **Dual experience mode**: full desktop shell inside the 3D MacBook on desktop, and a dedicated touch-first mobile shell (`MobileShell.tsx`) on smaller/coarse-pointer devices — same app registry and content, native touch-sized layouts.
- **Custom cursor system**: system-wide replacement pointer (desktop only) with distinct glyphs for every native cursor scenario — interactive, text, move, four resize directions, wait, and not-allowed — plus automatic dark-contrast inversion when hovering solid accent-teal buttons so the cursor never disappears into its own color.
- **Login screen**: a real per-session ID (`crypto.getRandomValues`), a live readable boot log (real build/session facts, not lorem), pointer-reactive tilt panels, a one-shot decrypt-in reveal on the operator name, and a one-shot access-granted sweep on submit. The guest lane is genuinely unrestricted — it accepts any input because it's read-only by design, not because it fakes a password check.
- **Aegis-M ambient companion**: a shell-local desktop buddy with hover/click lines, passive ambient thoughts, a real site changelog/update feed (with unread indicator), reduced-motion support, and context-aware recruiter/security/product copy.
- **Backdrop Studio (`backdrop.sys`)**: shell-only background switcher for animated desktop presets. Changes persist locally in the browser and do not touch the 3D scene.
- **Keyboard-first navigation**: `⌘/Ctrl/Alt + K` Spotlight, `F3` / modifier + `ArrowUp` Mission Control, plus minimize/quit shortcuts.
- **Cyber-noir visual system**: dark shell chrome, scanlines, cyan/violet accents, subtle glow, and layered backdrop treatments.

### Portfolio apps
- **Recruiter review apps**: native in-OS `CV.app`, `linkedin-experience.app`, `about.txt`, `contact.ssh`, `skills.app`, and `venderscope.browser`.
- **In-app CV rendering**: four recruiter-ready PDFs (GRC, FDE, GTM + CS, Tech Ops) with PDF.js preview plus download and open-in-tab fallbacks.
- **`coffee-chat.link`**: a browser-styled in-OS app that previews and links out to a real Calendly booking flow for 30-minute coffee chats.
- **`notes.app`**: a public guestbook wall — any visitor can pin a short note. Posts are server-moderated (profanity/link/spam filtering, per-visitor rate limiting) before appearing for everyone else.

### Syed-LLM (`syed-llm.app`)
A real, API-backed portfolio assistant (Google Gemini free tier, via a Vercel serverless function) rendered as a terminal-query interface rather than a chat widget. Answers are grounded exclusively in Zarak's real portfolio/project content — the prompt is scoped to that knowledge base and refuses to answer outside it — with streaming responses, cited sources, and action shortcuts (open CV, open LinkedIn, open Contact). Free-text Spotlight queries deep-link straight into it. Degrades gracefully to a clear "temporarily unavailable" state if the API or quota is unreachable — never a broken UI.

### Terminal (`terminal.app`)
A functional shell with portfolio-specific commands (`whoami`, `ls`, `cat`, `nmap`, `ps`, `uptime`, `history`, `fortune`, and more) plus a handful of hidden commands for the curious. `sudo -l` and `help` only tease that "some doors aren't labeled" — the real hints are diegetic: `ps`/`nmap` surface a suspicious privileged `auth-override` service, and `cat classified.txt` mentions its own (fake) encryption, both without spelling out the exact commands. Secret effects include a full-screen Matrix-style digital rain with a Neo-style "waking up" transition on exit, synced with the custom cursor.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Interactivity**: [React Draggable](https://github.com/react-grid-layout/react-draggable)
- **Document Rendering**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Testing**: [Playwright](https://playwright.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + HTML5 Canvas API
- **GIF Decoding**: [gifuct-js](https://github.com/matt-way/gifuct-js) (manual frame decode for Nyan Cat animation)
- **Backend**: [Vercel serverless functions](https://vercel.com/docs/functions) (`api/`) — no standalone server
- **LLM**: [Google Gemini API](https://ai.google.dev/) (free tier) powering Syed-LLM, with server-side prompt scoping and moderation
- **Data store**: [Upstash Redis](https://upstash.com/) (REST) for the guestbook wall and rate limiting
- **Content moderation**: [obscenity](https://github.com/jo3-l/obscenity) profanity/spam filtering on guestbook submissions

## Project Structure

```text
api/
├── ask.ts              # Syed-LLM serverless endpoint (Gemini call, prompt scoping)
└── notes.ts            # Guestbook serverless endpoint (moderation, rate limiting, Redis)
src/
├── assistant/          # Assistant answer engine (starter questions, actions, source data)
├── components/
│   ├── apps/           # Recruiter-facing apps, terminal, Syed-LLM, notes.app, coffee-chat, backdrop studio
│   ├── shell/          # Dock, menu bar, Spotlight, Mission Control, Aegis-M, mobile shell, shell appearance
│   ├── three/           # 3D scene components (MacBookScene, GroundEnvironment)
│   ├── CustomCursor.tsx # System-wide replacement pointer with per-scenario glyphs
│   ├── Desktop.tsx      # Main desktop shell composition
│   ├── LoginScreen.tsx  # Session entry sequence
│   └── Window.tsx       # Draggable/resizable window wrapper
├── data/                # Recruiter content, Aegis lines, ambient thoughts, update feed entries
├── effects/             # Self-contained visual effects (matrix rain/wake, cursor mode, glitch, sweeps)
├── notes/               # Guestbook client API + types
├── os/                  # App registry, command registry, reducer, provider, types
├── utils/               # Device tier / experience-mode detection
├── constants.ts         # Terminal command output
├── Scene3D.tsx          # Primary 3D orchestration layer
└── App.tsx              # Root application logic
content/
└── zarak-brain/         # Markdown knowledge base (frontmatter-driven, feeds Syed-LLM's scoped context)
scripts/
└── build-assistant-knowledge.mjs  # Compiles content/ → knowledge.generated.ts
tests/
└── e2e/                 # Playwright end-to-end test suite
```

## Key Shell Surfaces

- [`src/components/Desktop.tsx`](src/components/Desktop.tsx): desktop shell composition and background provider mount.
- [`src/components/shell/MobileShell.tsx`](src/components/shell/MobileShell.tsx): dedicated touch-first mobile OS experience.
- [`src/components/three/MacBookScene.tsx`](src/components/three/MacBookScene.tsx): 3D MacBook model, keyboard canvas textures, Nyan Cat GIF animation.
- [`src/components/shell/AegisBuddyPrototype.tsx`](src/components/shell/AegisBuddyPrototype.tsx): active Aegis-M implementation, including the update feed.
- [`src/components/CustomCursor.tsx`](src/components/CustomCursor.tsx) + [`src/effects/cursorMode.ts`](src/effects/cursorMode.ts): system-wide cursor replacement and its shared mode/shape state.
- [`src/components/LoginScreen.tsx`](src/components/LoginScreen.tsx): session entry sequence.
- [`src/components/apps/AskZarak.tsx`](src/components/apps/AskZarak.tsx) + [`api/ask.ts`](api/ask.ts): Syed-LLM window UI and its serverless Gemini endpoint.
- [`src/components/apps/NotesWall.tsx`](src/components/apps/NotesWall.tsx) + [`api/notes.ts`](api/notes.ts): guestbook UI and its serverless moderation/storage endpoint.
- [`src/components/apps/Terminal.tsx`](src/components/apps/Terminal.tsx) + [`src/constants.ts`](src/constants.ts): terminal app and its command output data.
- [`src/components/apps/CoffeeChat.tsx`](src/components/apps/CoffeeChat.tsx): in-OS Calendly booking preview/link-out.
- [`src/components/apps/BackgroundStudio.tsx`](src/components/apps/BackgroundStudio.tsx): backdrop selection app.
- [`src/os/appRegistry.tsx`](src/os/appRegistry.tsx): visible app registration and labels.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Vercel CLI](https://vercel.com/docs/cli) — required to run the `api/` serverless functions locally (Syed-LLM and the guestbook won't respond under a plain Vite dev server)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/syed-hassan7/zarak-os.git
   cd zarak-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set environment variables** (for local API testing):
   ```bash
   vercel env pull
   ```
   Requires `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` to be configured on the linked Vercel project. Without them, the shell still runs — Syed-LLM and the guestbook just degrade gracefully to an "unavailable" state.

4. **Start the development server**:
   ```bash
   vercel dev --listen 3000
   ```
   Use `npm run dev` instead if you only need the shell/UI and don't need the `api/*` endpoints to respond.

5. **Open the application**:
   Navigate to `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
```
Output goes to `dist/`. Deployed on Vercel; `api/*` ships as serverless functions alongside the static build.

## Validation

```bash
npm run lint
npm run build
```

`npm run build` also regenerates the assistant knowledge bundle from `content/zarak-brain/`.

## Testing

```bash
npm run test:e2e
```

Serial run (lower resource usage):
```bash
npm run test:e2e -- --workers=1
```

## Notes

- `syed-llm.app` is the visible product name; the internal app id remains `ask-zarak` to avoid unnecessary shell-state churn.
- Desktop backdrop changes are scoped to the flat shell layer and do not modify the 3D scene, lighting, or projection surfaces.
- 3D framing and screen projection are coupled in `Scene3D.tsx`; camera changes must keep the final MacBook screen overlay alignment intact.
- Aegis-M is a shell companion only — it does not launch apps or replace the Syed-LLM assistant flow.
- The custom cursor and Aegis-M mascot are desktop-only; `MobileShell.tsx` never mounts either, by design.
- MacBook keyboard canvas textures use `generateMipmaps=false` + `LinearFilter` to prevent blur at the steep (~53°) camera viewing angle.
- Both `api/ask.ts` and `api/notes.ts` run entirely on free-tier services (Google Gemini, Upstash Redis) — no paid API budget is required to run or fork this project.

## License

This project is the professional portfolio of Syed Zarak Hassan. All rights reserved.

---
**// END_OF_TRANSMISSION //**
