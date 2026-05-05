# ZARAK_OS // KERNEL_V2.7

ZARAK_OS is a high-fidelity cyber-noir portfolio operating system for **Syed Zarak Hassan**. It combines a custom desktop shell, recruiter-facing portfolio apps, a deterministic local assistant, and a full 3D workstation scene to present experience, projects, and security/GRC work as a product surface rather than a static website.

## Overview

The project is split between two presentation layers:

- **3D environment**: the immersive workstation scene built with Three.js / React Three Fiber.
- **OS shell**: the flat desktop UI rendered on top, including windows, dock, Spotlight, Mission Control, Aegis-M, and desktop backdrop controls.

The result is a portfolio that behaves more like a small operating system than a brochure site.

## Current Features

- **3D desk environment**: immersive workstation scene with the desktop shell projected into it.
- **Custom OS shell**: draggable, minimizable, resizable, stackable windows with dock, menu bar, Spotlight, and Mission Control flows.
- **Terminal-first identity**: a functional `terminal.app` with portfolio-specific commands and shell-style presentation.
- **Syed-LLM (`syed-llm.app`)**: local, source-limited portfolio assistant with no API or backend. Answers are produced from verified local content only, with typewriter streaming, sources, and action shortcuts.
- **Aegis-M ambient companion**: a shell-local desktop buddy with hover/click lines, passive thoughts, reduced-motion support, and context-aware recruiter/security/product copy.
- **Backdrop Studio (`backdrop.sys`)**: shell-only background switcher for animated desktop presets, including the restored original shell look. Changes persist locally in the browser and do not touch the 3D scene.
- **Recruiter review apps**: native in-OS `CV.app`, `linkedin-experience.app`, `about.txt`, `contact.ssh`, `skills.app`, and `venderscope.browser`.
- **In-app CV rendering**: PDF.js-powered CV preview with download and open-in-tab fallbacks.
- **Keyboard-first navigation**: `⌘/Ctrl/Alt + K` Spotlight, `F3` / modifier + `ArrowUp` Mission Control, plus minimize/quit shortcuts.
- **Dock and shell motion**: small-surface motion design built with `motion/react`, respecting reduced-motion preferences.
- **Cyber-noir visual system**: dark shell chrome, scanlines, cyan/violet accents, subtle glow, and layered backdrop treatments.
- **Desktop-first responsive behavior**: full shell on desktop, terminal-mode fallback on smaller screens.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Interactivity**: [React Draggable](https://github.com/react-grid-layout/react-draggable)
- **Document Rendering**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Testing**: [Playwright](https://playwright.dev/)
- **Graphics**: [Three.js](https://threejs.org/) & HTML5 Canvas API

## 📂 Project Structure

```text
src/
├── assistant/          # Local portfolio assistant engine
│   ├── answerEngine.ts # Query → answer resolver with starter questions
│   ├── search.ts       # Token-scored knowledge search (no API)
│   ├── actions.ts      # Action handlers (open app, copy email)
│   ├── types.ts        # AssistantAnswer, AssistantKnowledgeEntry types
│   └── knowledge.generated.ts  # Auto-generated from content/zarak-brain/
├── components/
│   ├── apps/           # Recruiter-facing apps, terminal, Syed-LLM, backdrop studio
│   ├── shell/          # Dock, menu bar, Spotlight, Mission Control, Aegis-M, shell appearance
│   ├── three/          # 3D scene components
│   ├── Desktop.tsx     # Main shell composition
│   ├── LoginScreen.tsx # Secure entry sequence
│   └── Window.tsx      # Draggable window wrapper
├── data/               # Recruiter content, Aegis lines, ambient thoughts
├── os/                 # App registry, command registry, reducer, provider, types
├── constants.ts        # Terminal command output
├── Scene3D.tsx         # Primary 3D orchestration layer
└── App.tsx             # Root 2D OS application logic
content/
└── zarak-brain/        # Markdown knowledge base (frontmatter-driven)
scripts/
└── build-assistant-knowledge.mjs  # Compiles content/ → knowledge.generated.ts
tests/
└── e2e/                # Playwright end-to-end test suite
```

## Key Shell Surfaces

- [`src/components/Desktop.tsx`](src/components/Desktop.tsx): shell composition and background provider mount.
- [`src/components/shell/AegisBuddyPrototype.tsx`](src/components/shell/AegisBuddyPrototype.tsx): active Aegis-M implementation.
- [`src/components/apps/AskZarak.tsx`](src/components/apps/AskZarak.tsx): Syed-LLM window UI.
- [`src/components/shell/FloatingAskZarak.tsx`](src/components/shell/FloatingAskZarak.tsx): Syed-LLM launcher orb.
- [`src/components/apps/BackgroundStudio.tsx`](src/components/apps/BackgroundStudio.tsx): backdrop selection app.
- [`src/components/shell/DesktopAppearance.tsx`](src/components/shell/DesktopAppearance.tsx): local shell appearance state and persistence.
- [`src/components/shell/DesktopBackgroundLayer.tsx`](src/components/shell/DesktopBackgroundLayer.tsx): animated shell-only background renderer.
- [`src/os/appRegistry.tsx`](src/os/appRegistry.tsx): visible app registration and labels.

## 🚀 Getting Started

To run this project locally in your IDE (like VS Code or Antigravity), follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone https://github.com/your-username/zarak-os.git
   cd zarak-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The Vite dev server is bound to `127.0.0.1` for local-only access.

4. **Open the application**:
   Navigate to `http://localhost:3000` in your browser.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist/` directory.

## Validation

Type and build validation:
```bash
npm run lint
npm run build
```

`npm run build` also regenerates the assistant knowledge bundle from `content/zarak-brain/`.

## 🛡️ Testing

For end-to-end validation:
```bash
npm run test:e2e
```

If your local machine struggles with parallel browser workers, a serial run is available:
```bash
npm run test:e2e -- --workers=1
```

## Notes

- `syed-llm.app` is the visible product name; the historical internal app id remains `ask-zarak` to avoid unnecessary shell-state churn.
- Desktop backdrop changes are intentionally scoped to the flat shell layer and do not modify the 3D scene, lighting, or projection surfaces.
- Aegis-M is currently an ambient shell companion only. It does not launch apps or replace the Syed-LLM assistant flow.

## 📄 License

This project is the professional portfolio of Syed Zarak Hassan. All rights reserved.

---
**// END_OF_TRANSMISSION //**
