# Agent Instructions for Rüdon Chatbot

## 📖 Project Overview

**Purpose**: An intelligent AI bot that answers questions and chats naturally.
**Type**: Web Application
**Primary Language(s)**: TypeScript
**Framework(s)**: Next.js, React
**Architecture**: The project is a standard Next.js application. It uses a single API route for handling chat functionality and a frontend built with React and shadcn/ui.

Concise rules for building accessible, fast, delightful UIs Use MUST/SHOULD/NEVER to guide decisions

## Interactions

- Keyboard
  - MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
  - MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
  - MUST: Manage focus (trap, move, and return) per APG patterns
- Targets & input
  - MUST: Hit target ≥24px (mobile ≥44px) If visual <24px, expand hit area
  - MUST: Mobile `<input>` font-size ≥16px or set:
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
    ```
  - NEVER: Disable browser zoom
  - MUST: `touch-action: manipulation` to prevent double-tap zoom; set `-webkit-tap-highlight-color` to match design
- Inputs & forms (behavior)
  - MUST: Hydration-safe inputs (no lost focus/value)
  - NEVER: Block paste in `<input>/<textarea>`
  - MUST: Loading buttons show spinner and keep original label
  - MUST: Enter submits focused text input In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
  - MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
  - MUST: Don’t block typing; accept free text and validate after
  - MUST: Allow submitting incomplete forms to surface validation
  - MUST: Errors inline next to fields; on submit, focus first error
  - MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
  - SHOULD: Disable spellcheck for emails/codes/usernames
  - SHOULD: Placeholders end with ellipsis and show example pattern (eg, `+1 (123) 456-7890`, `sk-012345…`)
  - MUST: Warn on unsaved changes before navigation
  - MUST: Compatible with password managers & 2FA; allow pasting one-time codes
  - MUST: Trim values to handle text expansion trailing spaces
  - MUST: No dead zones on checkboxes/radios; label+control share one generous hit target
- State & navigation
  - MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels) Prefer libs like [nuqs](https://nuqs.dev)
  - MUST: Back/Forward restores scroll
  - MUST: Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)
- Feedback
  - SHOULD: Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
  - MUST: Confirm destructive actions or provide Undo window
  - MUST: Use polite `aria-live` for toasts/inline validation
  - SHOULD: Ellipsis (`…`) for options that open follow-ups (eg, "Rename…") and loading states (eg, "Loading…", "Saving…", "Generating…")
- Touch/drag/scroll
  - MUST: Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
  - MUST: Delay first tooltip in a group; subsequent peers no delay
  - MUST: Intentional `overscroll-behavior: contain` in modals/drawers
  - MUST: During drag, disable text selection and set `inert` on dragged element/containers
  - MUST: No “dead-looking” interactive zones—if it looks clickable, it is
- Autofocus
  - SHOULD: Autofocus on desktop when there’s a single primary input; rarely on mobile (to avoid layout shift)

## Animation

- MUST: Honor `prefers-reduced-motion` (provide reduced variant)
- SHOULD: Prefer CSS > Web Animations API > JS libraries
- MUST: Animate compositor-friendly props (`transform`, `opacity`); avoid layout/repaint props (`top/left/width/height`)
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations are interruptible and input-driven (avoid autoplay)
- MUST: Correct `transform-origin` (motion starts where it “physically” should)

## Layout

- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use env(safe-area-inset-*))
- MUST: Avoid unwanted scrollbars; fix overflows

## Content & Accessibility

- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (“ ”); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don’t ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not ``)
- MUST: `scroll-margin-top` on headings for anchored links; include a “Skip to content” link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`, `Vercel&nbsp;SDK`

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) target <500 ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (eg, `virtua`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

## 📁 Directory Structure

```
/
├── app/ - Main application source code, including API routes and pages.
│   ├── api/chat/route.ts - API endpoint for the chatbot.
│   └── page.tsx - The main page of the application.
├── lib/ - Utility functions.
│   └── utils.ts
├── node_modules/ - Project dependencies.
├── .env.local.example - Example for environment variables file.
├── next.config.mjs - Configuration file for Next.js.
├── package.json - Project dependencies and scripts.
└── tsconfig.json - TypeScript configuration.
```

## 🚀 Development Setup

### Installation
```bash
# Clone repository
git clone [repo-url]
cd rudon-chatbot

# Install dependencies
npm install
```

### Environment Variables
Create a `.env.local` file in the root of the project and add the following environment variables:

```bash
MISTRAL_API_KEY=your_mistral_api_key
```

### Build

```bash
npm run build
```

### Run Locally

```bash
npm run dev
```

### Run Tests
There are currently no tests in this project.

## 🎨 Code Style & Conventions

- **Formatting**: The project uses Prettier for code formatting, which is integrated with ESLint.
- **Naming conventions**:
- Variables: `camelCase`
- Classes: `PascalCase`
- Files: `kebab-case`
- Constants: `UPPER_SNAKE_CASE`
- **File organization**: The project follows the standard Next.js `app` directory structure.

## 🧪 Testing Guidelines

There are currently no testing guidelines for this project.

## 🏗️ Important Patterns & Conventions

### API Design

- The project uses a single API endpoint at `/api/chat` for handling chat functionality.
- The API follows the Vercel AI SDK conventions.

## 🔒 Security Considerations

### Sensitive Files (Never Commit)

- `.env.local` - Environment variables

### Environment Variables

```bash
# Required variables (add to .env.local)
MISTRAL_API_KEY=your_mistral_api_key
```

## ✅ Common Tasks

### Adding a New API Endpoint

1. Create a new file in `app/api/` with a descriptive name.
2. Implement the business logic for the new endpoint.

### Adding a New React Component

1. Create a new component file in a `components/` directory (to be created).
2. Add styles for the component.
3. Write tests for the component.
4. Export the component from an `index.ts` file in the `components/` directory.

## 📤 Git & Commit Conventions

### Branch Naming

- Feature: `feature/user-authentication`
- Bug fix: `fix/login-error`
- Hotfix: `hotfix/security-patch`
- Refactor: `refactor/api-structure`

### Commit Messages

Follow Conventional Commits:

```
feat(auth): add password reset functionality
fix(api): resolve race condition in user creation
docs(readme): update installation instructions
```

## 🚢 Deployment

The project is configured to be deployed on Vercel.

### Environments

- **Development**: Deployed from the `develop` branch.
- **Production**: Deployed from the `main` branch.

### Deploy Commands

Deployment is handled automatically by Vercel when changes are pushed to the `main` or `develop` branches.
