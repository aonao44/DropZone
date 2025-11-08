# Supabase Query Helper

Create Supabase queries for $ARGUMENTS following DropZone database patterns.

## Task

I'll help you create Supabase queries with:

1. **Type-safe queries**: Use TypeScript types from `@/lib/types`
2. **Server-side client**: Use `createClient` from `@/lib/supabase/server`
3. **Error handling**: Proper error checking and handling
4. **Query optimization**: Efficient selects and filters
5. **RLS policies**: Respect Row Level Security

## Supabase Client Usage

### Server Components / API Routes

```typescript
import { createClient } from '@/lib/supabase/server'

// In Server Component
export default async function ServerComponent() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('table_name')
    .select('*')

  if (error) {
    console.error('Database error:', error)
    // Handle error
  }

  return <div>{/* Use data */}</div>
}
```

### Client Components

```typescript
'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Common Query Patterns

### Select with Filters

```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Insert

```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    name: 'Project Name',
    user_id: userId,
    slug: 'unique-slug'
  })
  .select()
  .single()
```

### Update

```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ name: 'New Name' })
  .eq('id', projectId)
  .select()
  .single()
```

### Delete

```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
```

### Join Tables

```typescript
const { data, error } = await supabase
  .from('submissions')
  .select(`
    *,
    submission_files(*)
  `)
  .eq('project_id', projectId)
```

## DropZone Database Tables

- **projects**: Project information
- **submissions**: Client submissions
- **submission_files**: Uploaded files metadata

## Error Handling

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')

if (error) {
  console.error('Supabase error:', error.message)
  throw new Error('Database operation failed')
}

if (!data) {
  throw new Error('No data returned')
}
```

## TypeScript Types

Import types from `@/lib/types.ts`:

```typescript
import type { Project, Submission, SubmissionFile } from '@/lib/types'

const projects: Project[] = data
```

## Important Notes

- Always use server-side client in Server Components
- Check for errors after every query
- Use proper TypeScript types
- Optimize queries (select only needed columns)
- Respect RLS policies
- Use transactions for related operations
