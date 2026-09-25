# ZARAK_OS — Design System v2

Status: **authoritative**. Any UI change in this project should be checkable
against this document. If a decision isn't here, add it here before shipping
it — this file exists so we stop re-litigating the same calls across sessions.

Theme identity: **macOS window chrome × Linux/terminal soul.** Traffic-light
windows, a dock, a menu bar, Spotlight, Mission Control — running on a
cyber-noir security-operator skin (JetBrains Mono, scanlines, cyan/violet
signal colors, uppercase tracked labels). Keep that identity. Everything
below is in service of making it feel *less generic-AI-glass* and *more
performant*, not replacing it.

---

## 1. Brand & tone

- Audience: recruiters / hiring managers / engineers evaluating Syed Zarak
  Hassan (GRC / security / technical builder). Every surface should read as
  "specialist tool," never "template."
- Voice: terse, technical, lower-case-log-style in system copy
  (`→ result: ...`), sentence case in human-facing copy. No exclamation
  marks. No "Welcome!" energy.
- Humor budget: one motif max per surface (Aegis-M mascot covers this).
  Don't stack multiple "cute" ideas in the same view.

---

## 2. Color tokens

Defined in `src/index.css` under `@theme`. Do not introduce new one-off hex
values in components — extend this table and the CSS var, then consume the
Tailwind token.

| Token | Value | Use |
|---|---|---|
| `--color-os-bg` | `#05070A` | App background, deepest layer |
| `--color-os-chrome` | `#0D1117` | Window chrome / titlebars base |
| `--color-os-border` | `#1F2937` | Structural borders (non-glass) |
| `--color-os-text-pri` | `#E6EDF3` | Primary text |
| `--color-os-text-sec` | `#7D8590` | Secondary/meta text |
| `--color-os-accent` | `#2DD4BF` | Primary signal (cyan) — actions, focus, "alive" state |
| `--color-os-warn` | `#C084FC` | Secondary signal (violet) — accents, secondary data series |
| `--color-os-danger` | `#F87171` | Destructive / close / error |
| `--color-os-success` *(new)* | `#4ADE80` | Success states, "verified," online |
| `--color-os-surface` | `#0D1117` | Card/panel base fill |

Rules:
- Cyan = primary interactive/active signal. Violet = secondary/complementary
  data or accent only — never the primary CTA color.
- Never use pure white text/borders above 30% opacity for structural
  elements; everything sits on translucent white (`white/NN`) over the dark
  base so the whole app stays tonally dark.
- Gradients: max 2 color stops beyond transparent, radial or linear only,
  always anchored to accent (cyan) or warn (violet) — no rainbow gradients.

---

## 3. Typography

- Font: JetBrains Mono everywhere (`--font-mono`). This is a monospace-only
  product — do not introduce a sans/serif pairing.
- Scale (Tailwind arbitrary values already used; formalize as the ceiling):
  - Display: `44–64px`, tracking `-0.02em to -0.045em`, weight 600 — used
    once per screen max (login clock, hero name).
  - Heading: `20–28px`, weight 600, tracking tight.
  - Body: `13–15px`, weight 400–500, line-height 1.5–1.6.
  - Label/meta: `9–11px`, weight 600, `uppercase`, tracking `0.14em–0.22em`.
  - Code/terminal: `12–13px`, weight 400, tabular-nums where numeric.
- Labels are ALWAYS uppercase + tracked when they're metadata (status,
  category, timestamps). Body copy is sentence case. Don't mix.

---

## 4. Spacing & radius

- Spacing scale: multiples of 4px (Tailwind default `1=4px`). Component
  padding steps: `2, 3, 4, 5, 6, 8` — don't invent odd values like `2.5rem`
  paddings without a reason recorded here.
- Radius scale (the "squircle" language is core to the OS feel):
  - `xl` windows/cards: `24–30px`
  - `lg` buttons/inputs/dock icons: `16–20px`
  - `md` badges/kbd/chips: `8–12px`
  - `full` pills/dots/status indicators
- Never mix a sharp-corner (`rounded-none`/`rounded-sm`) element into a
  glass surface — everything glass is soft-radius.

---

## 5. Glass system — tiered, perf-aware

The old system used one blur level (`backdrop-blur-2xl`, 32–40px)
everywhere, stacked across dock + windows + tooltips + menu bar
simultaneously. That's the #1 perf cost on low-end/Firefox/Safari. New rule:
**glass has three tiers, and only tier 3 stacks.**

| Tier | CSS | Where |
|---|---|---|
| `glass-1` (light) | `backdrop-blur-md` (12px), `bg-white/[0.06]` | Tooltips, dock item hover states, menu bar dropdown items — anything transient |
| `glass-2` (standard) | `backdrop-blur-xl` (24px), `bg-white/[0.08]` | Dock, menu bar, Spotlight, Mission Control — the *persistent chrome*, capped at one such layer visible at a time in the same screen region |
| `glass-3` (hero) | `backdrop-blur-2xl` (40px) + saturate | Login screen only, and only 1–2 elements per screen — reserved for the single moment that should feel premium |

Hard rules:
- **Max 2 blurred layers visibly overlapping at once** (e.g. an active
  window over the desktop background is fine; an active window's tooltip
  over the window over the desktop is not — drop the tooltip's blur, it's a
  solid dark chip instead).
- Windows use `glass-2`, not `glass-3`. They're the most numerous blurred
  surface on screen (up to ~6 simultaneously) — this alone was likely the
  single biggest perf hit on low-end devices.
- On `deviceTier === 'lite'` (see §9), **all backdrop-filter blur is
  replaced with a flat translucent fill** (`bg-os-bg/92` etc, no blur at
  all). This must be a single CSS class swap (`.glass-2` vs `.glass-2-flat`)
  driven by a `data-tier` attribute on `<html>`, not per-component
  conditionals.

---

## 6. Motion system

- Durations: `fast=120ms` (hover/press feedback), `base=200ms` (window
  open/close, dock bounce), `slow=450ms` (screen-level transitions),
  `hero=1200–1800ms` (intro sequence only, and only once per session — see
  §8).
- Easing: `standard = [0.22, 1, 0.36, 1]` (current login easing — keep it,
  it's good) for entrances; `emphasized-decel` for anything settling into
  place; linear only for literal progress bars.
- Every animated component must check `useReducedMotion()` (motion/react)
  or `prefers-reduced-motion` media query and degrade to an opacity-only or
  zero-duration transition. This is already mostly followed — keep it as a
  hard requirement for all new components.
- Ambient/infinite animations (breathing glows, floating particles) are
  **capped at one concurrent ambient loop per screen region** and must pause
  when `document.visibilityState === 'hidden'` and when reduced motion is
  set. `DigitalBackground.tsx` already does the visibility check — replicate
  that pattern, don't reinvent it.
- No animation may run at `frameloop="always"` indefinitely. Three.js
  scenes use `frameloop="demand"` and call `invalidate()` only while
  something is actually moving.

---

## 7. Window chrome & app icon rules

This is the strongest asset in the project — protect it.

- Traffic lights: red/yellow/green, fixed colors (`#ED6A5E` / `#F5BF4F` /
  `#62C554`), fixed order, fixed 12–14px size. Never themeable per-app.
- Titlebar: uppercase mono label, centered, `glass-2`, 40–48px tall.
- App icon glyphs: one Lucide icon per app, `size=22–24`, `strokeWidth=1.5`,
  no filled icons, no custom SVG mascots except Aegis-M (which is the one
  deliberate exception — one mascot per OS, not per app).
- Every new `.app` in the registry must ship: a Lucide icon, a
  `label` ending in a file-extension-style suffix consistent with siblings
  (`.app`, `.sys`, `.ssh`, `.browser`, `.txt` — pick whichever reads as most
  "real" for that app's function, don't default to `.app` for everything),
  `searchKeywords`, and default/min window sizes tested at 1280×800 and
  1920×1080.
- Dock badge dot: single dot under active/open apps, no numeric badges, no
  color-coded categories — keep the dock visually calm.

---

## 8. Boot & session choreography

The 3D MacBook intro is the single most distinctive asset in the project.
Rules for how it's allowed to behave:

- **Plays once per browser per N days** (localStorage flag,
  `zarak_os_intro_seen_at`, TTL 14 days) — repeat visitors within the window
  go straight to login. A visible "skip" affordance (tap/click/any key)
  must always be available from frame 1, never a silent forced wait.
- The 3D scene and the 2D app are **never both mounted long-term**. The
  Canvas exists only for the duration of the flight; once the handoff
  completes, the Three.js scene unmounts fully (dispose geometries/
  materials/textures) and the 2D app takes over the real viewport at 1:1 —
  it does not keep living as a scaled projection inside a laptop screen
  mesh. See §11 for the technical contract.
- The login → desktop transition is a **continuity transition**, not a
  crossfade: at least one visual anchor (the identity mark / name lockup)
  persists across the cut via a shared layout animation
  (`motion` `layoutId`), everything else animates around it. No plain
  `AnimatePresence mode="wait"` opacity swap between two unrelated layouts.

---

## 9. Performance tiers (device-aware, not just mobile/desktop)

Replace the old binary `canRender3DScene()` (core-count + WebGL-presence
only) with three explicit tiers, computed once at boot and stored as
`data-tier` on `<html>`, plus a manual override the user can always reach
(Backdrop/System app → Performance):

| Tier | Trigger | Behavior |
|---|---|---|
| `full` | desktop, WebGL2, `hardwareConcurrency >= 6`, no reduced-motion, GPU probe passes | 3D intro, `glass-2`/`glass-3`, ambient particles on |
| `balanced` | desktop, WebGL available but weaker signal (4–5 cores, or GPU probe borderline) | Skip 3D intro (go straight to a fast 2D boot), keep glass but drop ambient particle fields and non-essential infinite animations |
| `lite` | mobile, `hardwareConcurrency < 4`, WebGL unavailable, reduced-motion, or user override | No 3D, flat surfaces instead of blur (§5), animations capped to opacity/transform only, particle/canvas backgrounds disabled entirely |

GPU probe (cheap, ~1 frame): render a single triangle to an offscreen
WebGL context and time it, or read `WEBGL_debug_renderer_info` when
available; never block first paint on this — compute it in parallel with
the loader and default to `balanced` if it hasn't resolved in 150ms.

---

## 10. Accessibility baseline (non-negotiable)

- Every interactive element has a visible focus ring
  (`focus-visible:ring-2 ring-white/60` pattern already used — keep it
  everywhere new).
- Color is never the only signal (status also gets a label/icon, not just a
  colored dot).
- `prefers-reduced-motion` disables all decorative motion, not just slows
  it.
- Contrast: body text on glass surfaces must hit WCAG AA against the
  darkest realistic background state (test against `os-bg`, not against a
  lit-up hover state).

---

## 11. Technical contracts for implementers

- **Intro/App decoupling:** `Scene3D` renders `App` as a real DOM overlay
  scaled onto the laptop screen only *during* the flight. On
  `handleCameraComplete`, instead of just fading the overlay in, it must
  trigger a full unmount of the `Canvas` + scene graph and mount `App` at
  the document root at natural 1:1 scale. `main.tsx` owns this state
  machine, not `Scene3D` internally continuing to exist underneath.
- **Chunking:** `pdf.js`, `recharts`, and `three`/`@react-three/*` must each
  resolve to their own async chunk, loaded only when the consuming app
  mounts (already lazy at the app-registry level for most — verify pdf.js
  worker isn't fetched until `DownloadCV` actually renders, and don't
  default-open the CV app).
- **Frame loop:** any `<Canvas>` uses `frameloop="demand"`; anything that
  animates every frame calls `invalidate()` per tick and stops once
  settled. No component may set `frameloop="always"`.
- **Tier flag:** compute once in a module (`src/utils/deviceTier.ts`),
  expose `useDeviceTier()` hook + `getDeviceTier()` sync accessor, set
  `document.documentElement.dataset.tier`, and gate `.glass-2`/`.glass-3`
  CSS + intro mounting + particle components off that single source of
  truth. No component re-derives tier logic locally.

---

## 12. Change log

- **v2 (this doc):** introduced tiered glass system, performance tiers,
  boot choreography rules, continuity-transition requirement. Superseded
  the implicit "blur everything, animate everything, always" approach of
  v1.
