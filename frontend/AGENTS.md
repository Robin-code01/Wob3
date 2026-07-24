<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md

> Instructions for AI agents (GitHub Copilot, Cursor, Claude Code, etc.) working on this Next.js frontend codebase.

---

## 1. Project Overview & Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (`strict` mode enabled)
- **Styling:** Tailwind CSS and Radix UI modals
- **State Management:** React Server Components (RSC) by default, Zustand for client state

---

## 2. Core Architectural Rules

### Server vs. Client Components

- **Default to Server Components:** Every component in `app/` is a Server Component unless explicitly marked with `'use client'`.
- **Push `'use client'` to the Leaves:** Never mark a layout or top-level page as a Client Component. Wrap interactive elements (buttons, forms, hooks) into small leaf components.
- **Data Fetching:** Fetch data directly inside Server Components using `async/await`. Do not use client-side fetchers (`useEffect`, `SWR`, or `React Query`) for initial page loads unless streaming or polling is strictly required.

### Directory Structure Protocol

```text
src/
├── app/                    # Application layer (Routes, Pages, Providers)
│   ├── routes/             # Route configurations & page components
│   │   ├── app/            # Main protected application routes
│   │   ├── auth/           # Public auth routes (login, register)
│   │   └── index.tsx       # Root router setup
│   ├── app.tsx             # Root Application component
│   └── provider.tsx        # Global App Provider (wraps QueryClient, Auth, Theme, etc.)
│
├── assets/                 # Global static assets (images, svg, fonts)
│
├── components/             # Global, domain-agnostic UI components (Atoms/Molecules)
│   ├── ui/                 # Dumb UI elements (Button, Input, Modal)
│   ├── errors/             # Global Error Boundaries & Fallbacks
│   ├── layout/             # Layout skeletons (Header, Sidebar, MainLayout)
│   └── notifications/      # Toast / Notification banners
│
├── config/                 # Global app variables, ENV exports, constants
│
├── features/               # FEATURE-BASED MODULES (Core Domain Logic)
│   └── [feature-name]/     # Example: features/discussions/
│       ├── api/            # API queries, mutations, and hooks (React Query / RTK Query)
│       ├── assets/         # Feature-specific static assets
│       ├── components/     # UI components exclusive to this feature
│       ├── hooks/          # Custom hooks scoped strictly to this feature
│       ├── stores/         # Feature-specific state management (Zustand, Redux)
│       ├── types/          # Feature-specific TypeScript interfaces/types
│       ├── utils/          # Helper functions isolated to this feature
│       └── index.ts        # PUBLIC API BARREL (Exposes what other parts of app can use)
│
├── hooks/                  # Global, shared custom React hooks
│
├── lib/                    # Pre-configured third-party library wrappers (axios, dayjs, etc.)
│
├── stores/                 # Global state stores (Auth user state, Global Theme)
│
├── testing/                # Test setup, custom renderers, MSW handlers, mocks
│
├── types/                  # Global ambient types & shared DTOs
│
└── utils/                  # Global utility functions (formatting, validation helpers)
```

## 3. Bug Fixing & Scope Rules

When tasked with fixing a bug, resolving an error, or addressing an issue, follow these strict scope boundaries:

### Edit Only Bug-Related Files

- **Strict File Scope:** You are ONLY permitted to edit files directly involved in reproducing or resolving the assigned bug.
- **No Unnecessary Touch:** Do NOT modify, reformat, or refactor unrelated files, configs, or imports unless it is strictly necessary to make the fix compile and run.

### Flag Unrelated Problems (Do Not Auto-Fix)

If you spot secondary issues while investigating a bug (e.g., code smells, performance bottlenecks, dead code, type errors, or unrelated bugs in adjacent files):

- 🛑 **DO NOT FIX THEM:** Leave the code untouched.
- 📋 **TELL US:** Report your findings clearly at the end of your response under a `### 💡 Unrelated Issues Found` section so the team can review and decide how to handle them.

---

### Response Format for Bug Fixes

When fixing a bug, structure your output as follows:

1. **Root Cause:** A brief explanation of what caused the bug.
2. **Applied Fix:** The minimal changes made to the relevant file(s).
3. **Unrelated Issues Found (If Any):** A quick heads-up about any other issues or anti-patterns observed in the code without editing them.

---

<!-- END:nextjs-agent-rules -->
