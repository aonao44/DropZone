# API Route Generator

Create a Next.js API Route for $ARGUMENTS in the `app/api/` directory.

## Task

I'll create an API Route with:

1. **Route handler**: Implement GET/POST/PUT/PATCH/DELETE methods
2. **Request validation**: Validate incoming data with Zod
3. **Error handling**: Proper error responses with status codes
4. **Database operations**: Use Supabase for data operations
5. **Authentication**: Use Clerk for protected routes
6. **TypeScript types**: Proper request/response types

## DropZone API Conventions

⚠️ **IMPORTANT**: In DropZone, we **avoid GET API routes**.
- ✅ **Use Server Components** for data fetching instead
- ✅ **Only create APIs for**: POST, PUT, PATCH, DELETE (mutations)
- ✅ **API Routes are for**: User data operations, not reads

## Allowed HTTP Methods

- **POST** - Create new resources
- **PUT** - Replace entire resources
- **PATCH** - Update partial resources
- **DELETE** - Remove resources

## Route Handler Structure

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()

    // 3. Database operation
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('table_name')
      .insert(body)
      .select()

    if (error) throw error

    // 4. Return success response
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

## Authentication with Clerk

```typescript
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Database with Supabase

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('table_name')
  .select()
```

## Response Status Codes

- **200** - Success (GET, PUT, PATCH, DELETE)
- **201** - Created (POST)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

## Important Notes

- **NO GET routes** - Use Server Components instead
- Always validate request data
- Include proper error handling
- Use TypeScript for type safety
- Add authentication checks for protected routes
- Return consistent error response format
