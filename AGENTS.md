# Repository Guidelines

## Project Structure & Module Organization
- `app/`: App Router routes, shared layouts, server components; co-locate loaders/actions per feature folder.
- `components/` & `components/ui/`: Reusable UI built on shadcn + Tailwind tokens; import via `@/components/...`.
- `hooks/`, `lib/`, `utils/`: Client hooks, Supabase/Clerk adapters, and cross-cutting helpers—update here instead of duplicating logic.
- `supabase/`: Query builders and generated types; keep framework-agnostic for future worker reuse.
- `public/` & `test/`: Marketing assets, icons, manual QA references.

## Build, Test, and Development Commands
- `npm install`: Sync dependencies; never edit `package-lock.json` manually.
- `npm run dev`: Next.js 15 dev server with hot reload; requires `.env.local` for Supabase + Clerk keys.
- `npm run build`: Production bundle validation (types + lint); run before every PR.
- `npm run start`: Serve the compiled app to repro production-only issues.
- `npm run lint`: ESLint via `next lint`; match CI before pushing.

## Coding Style & Naming Conventions
- TypeScript mandatory; exported functions/components need explicit return types to keep server/client boundaries obvious.
- Components live in PascalCase files; hooks/utilities use camelCase. Prefer server components, add `'use client'` only for interactive sections.
- Tailwind utilities are the default styling layer; extract shared patterns into small wrapper components instead of global CSS.
- API clients and forms should validate with Zod before network calls; surface errors via `sonner` toasts or inline messages.

## Testing Guidelines
- Automated tests are not wired yet; when adding them, colocate specs under the feature (`app/(dashboard)/__tests__/...`) and keep visual fixtures in `test/`.
- Cover edge cases first: failed UploadThing transfers, Supabase timeouts, and Clerk session expiry. Document manual repro steps in PRs until tooling lands.
- Snapshot any UI change in `test/test_screenshot` so design review stays lightweight.

## Commit & Pull Request Guidelines
- Conventional Commits only (`feat:`, `fix:`, `chore:`, etc.); keep each commit scoped to one concern.
- PR checklist: concise summary, screenshots for UI shifts, linked issue/Linear ticket, and confirmation that `npm run lint && npm run build` passed locally.
- Request review once open questions are resolved; convert to draft if env setup or schema work is ongoing.

## Security & Configuration Tips
- Never commit secrets; mirror new keys to `.env.example` and load via `process.env`.
- Validate every external payload (UploadThing, axios, Clerk webhooks) with strict schemas, and surface auth failures through centralized logging.
