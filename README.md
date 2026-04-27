# ZARAK_OS // KERNEL_V2.6.1

A high-fidelity, immersive "Cyber-Noir" portfolio operating system built for **Syed Zarak Hassan**. This project simulates a terminal-driven, retro-futuristic desktop environment seamlessly embedded into a full 3D interactive hacker workspace to showcase professional experience, skills, and projects in the field of Compliance and Information Security.

## 🌑 Overview

ZARAK_OS is more than a portfolio; it's a digital experience featuring a custom window manager, functional terminal, and interactive 3D desktop. It abandons generic web patterns for a technical, "specialist tool" cyber-noir aesthetic inspired by classic terminal interfaces.

### Key Features

- **3D Desk Environment**: A fully immersive, procedurally lit 3D hacker workspace constructed with Three.js and React Three Fiber.
- **Secure Login**: A themed authentication screen with biometric session tracking.
- **Window Manager**: Fully draggable, minimizable, resizable, and stackable windows with session layout persistence.
- **Functional Terminal**: Custom command-line interface with commands like `ls`, `help`, `open`, and `ssh`.
- **Recruiter Review Apps**: Native in-OS `CV.app` and `linkedin-experience.app` windows for resume review and LinkedIn snapshot browsing.
- **In-App CV Rendering**: PDF.js-powered CV preview with download and open-in-tab fallbacks when browser PDF plugins are blocked.
- **LinkedIn Experience Snapshot**: Static recruiter-friendly LinkedIn profile and experience view with a direct connect CTA.
- **Spotlight + Mission Control**: Keyboard-first shell interactions for app search, launch, and overview.
- **Digital Background**: A dynamic, canvas-based animated grid that reacts to the system state.
- **Cyber-Noir Aesthetic**: A deep navy and electric teal color palette with CRT scanline overlays and subtle digital glows.
- **Responsive Design**: Optimized for desktop use while maintaining a stable "terminal mode" for mobile devices.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Interactivity**: [React Draggable](https://github.com/react-grid-layout/react-draggable)
- **Document Rendering**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Testing**: [Playwright](https://playwright.dev/)
- **Graphics**: [Three.js](https://threejs.org/) & HTML5 Canvas API

## 📂 Project Structure

```text
src/
├── components/
│   ├── apps/           # Recruiter-facing apps, terminal, and portfolio modules
│   ├── shell/          # Dock, menu bar, Spotlight, Mission Control, window manager
│   ├── three/          # 3D scene components
│   ├── Desktop.tsx     # Main shell composition
│   ├── LoginScreen.tsx # Secure entry sequence
│   └── Window.tsx      # Draggable window wrapper
├── data/
│   └── recruiterProfile.ts  # Typed single source of truth for recruiter-facing facts
├── os/                 # App registry, command registry, reducer, provider, types
├── constants.ts        # Terminal command output
├── Scene3D.tsx         # Primary 3D orchestration layer
└── App.tsx             # Root 2D OS application logic
```

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

## 🛡️ Security Audits

This project is designed with a "Security First" mindset. The UI reflects GRC (Governance, Risk, and Compliance) principles. You can run the following to check for type safety:
```bash
npm run lint
```

For end-to-end validation:
```bash
npm run test:e2e
```

If your local machine struggles with parallel browser workers, a serial run is available:
```bash
npm run test:e2e -- --workers=1
```

## 📄 License

This project is the professional portfolio of Syed Zarak Hassan. All rights reserved.

---
**// END_OF_TRANSMISSION //**
