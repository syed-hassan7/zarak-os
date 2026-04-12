# ZARAK_OS // KERNEL_V3.0.0

A high-fidelity, immersive "Cyber-Noir" portfolio operating system built for **Syed Zarak Hassan**. This project simulates a terminal-driven, retro-futuristic desktop environment seamlessly embedded into a full 3D interactive hacker workspace to showcase professional experience, skills, and projects in the field of Compliance and Information Security.

## 🌑 Overview

ZARAK_OS is more than a portfolio; it's a digital experience featuring a custom window manager, functional terminal, and interactive 3D desktop. It abandons generic web patterns for a technical, "specialist tool" cyber-noir aesthetic inspired by classic terminal interfaces.

### Key Features

- **3D Desk Environment**: A fully immersive, procedurally lit 3D hacker workspace constructed with Three.js and React Three Fiber.
- **Boot Sequence**: A realistic system initialization sequence with diagnostic logs.
- **Secure Login**: A themed authentication screen with biometric session tracking.
- **Window Manager**: Fully draggable and stackable windows with glassmorphism effects.
- **Functional Terminal**: Custom command-line interface with commands like `ls`, `help`, `open`, and `ssh`.
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
- **Graphics**: [Three.js](https://threejs.org/) & HTML5 Canvas API

## 📂 Project Structure

src/
├── components/          # UI Components
│   ├── apps/           # Individual OS Applications
│   ├── three/          # 3D Scene Components (Desk, Room, Lights, Loaders)
│   ├── BootScreen.tsx  # Initial boot sequence
│   ├── LoginScreen.tsx # Secure entry sequence
│   ├── Desktop.tsx     # Main desktop environment
│   ├── Taskbar.tsx     # System taskbar & status
│   └── Window.tsx      # Draggable window wrapper
├── constants.ts        # Terminal commands and app data
├── index.css           # Global styles & Tailwind config
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

## 📄 License

This project is the professional portfolio of Syed Zarak Hassan. All rights reserved.

---
**// END_OF_TRANSMISSION //**
