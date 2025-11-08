# Next.js App Router Page Generator

Create a Next.js App Router page at the specified path: $ARGUMENTS

## Requirements

1. **Analyze project structure**: Check existing pages in `app/` directory
2. **Determine page type**: Server Component (default) or Client Component
3. **Create route structure**: Generate proper `page.tsx` with Next.js conventions
4. **Add metadata**: Include proper Next.js metadata configuration
5. **Implement layout**: Use existing layout patterns from the project
6. **Add error handling**: Include error.tsx if needed
7. **Add loading state**: Include loading.tsx if appropriate

## Next.js App Router Conventions

- **Default to Server Components**: Use Server Components unless interactivity is needed
- **Client Components**: Only use `'use client'` when:
  - Using React hooks (useState, useEffect, etc.)
  - Browser APIs are needed
  - Event handlers are required
- **Metadata**: Use `generateMetadata` or `metadata` export for SEO
- **File conventions**:
  - `page.tsx` - Route page
  - `layout.tsx` - Shared layout
  - `loading.tsx` - Loading UI
  - `error.tsx` - Error handling
  - `not-found.tsx` - 404 page

## DropZone Project Specifics

- **Authentication**: Use Clerk for protected routes
- **Database**: Use Supabase via `@/lib/supabase/server`
- **Styling**: Use TailwindCSS with Shadcn/ui components
- **Data fetching**: Fetch data directly in Server Components (no API routes for GET)
- **Path aliases**: Use `@/` prefix (e.g., `@/components/ui/button`)

## Important Notes

- Follow existing page structure in `app/` directory
- Check if authentication is required for this route
- Use Server Components by default for better performance
- Include proper TypeScript types
- Add appropriate error boundaries
