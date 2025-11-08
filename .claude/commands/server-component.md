# Server Component Generator

Create a React Server Component for $ARGUMENTS following Next.js 15 conventions.

## Task

I'll create a Server Component with:

1. **TypeScript types**: Proper props interface
2. **Data fetching**: Direct database/API calls (no client-side fetching)
3. **Async component**: Use async/await for data fetching
4. **Streaming**: Consider Suspense boundaries for loading states
5. **Metadata**: Include metadata exports if needed

## Server Component Rules

✅ **Can do in Server Components:**
- Fetch data directly from database/APIs
- Access backend resources securely
- Use async/await at component level
- Reduce client-side JavaScript
- Improve SEO with server-rendered HTML

❌ **Cannot do in Server Components:**
- Use React hooks (useState, useEffect, etc.)
- Use browser APIs (localStorage, window, etc.)
- Add event listeners (onClick, onChange, etc.)
- Use context consumers (must be Client Components)

## DropZone Conventions

- **Database access**: Import from `@/lib/supabase/server`
- **Authentication**: Use Clerk's server helpers
- **Styling**: TailwindCSS + Shadcn/ui components
- **Error handling**: Use error boundaries with error.tsx
- **Loading states**: Use loading.tsx or Suspense

## Example Structure

```typescript
// Server Component (default)
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ServerComponent({ params }: PageProps) {
  // Direct data fetching
  const data = await fetchDataFromSupabase()

  return (
    <div>
      {/* Server-rendered content */}
    </div>
  )
}
```

## Important Notes

- Default to Server Components for better performance
- Only use Client Components when interactivity is needed
- Keep Server Components as close to data sources as possible
- Use Suspense for incremental loading
