# Responsive & Typography _Fix_

Purpose: Improve responsive layout and typography _by actually editing files_.

**Args**

- paths: string[] # e.g. ["app/pricing","components"]
- url?: string # e.g. "http://localhost:3000"

**Scope**

- Only touch files under `paths` with .tsx/.ts/.css (incl. Tailwind classes).
- Do not change business logic. Focus on markup/classes/styles only.

**Targets**

- Replace fixed px font-sizes with rem and fluid type via clamp().
- Keep line-length ~45–75ch; set body line-height ~1.5.
- Use responsive containers (e.g., mx-auto w-full max-w-screen-lg xl:max-w-screen-xl px-4 sm:px-6 md:px-8).
- Avoid fixed widths/heights; prefer max-w, flex/grid, wrap-safe utilities.
- Ensure tap targets ≥ 44×44; maintain heading hierarchy; fix overflow/wrap issues across 320/375/768/1024/1280/1536.

**Process**

1. Inspect all files under `paths` and identify issues.
2. Propose minimal unified diffs.
3. **Apply** those diffs using Write/Edit/MultiEdit.
4. If available, run `npm run lint -- --fix` on changed files (non-blocking).
5. Output a summary of changed files and rationale.

**Output**

- Short summary, list of changed files, and the applied diffs.
