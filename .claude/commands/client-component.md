# Client Component Generator

Create a React Client Component for $ARGUMENTS with `'use client'` directive.

## Task

I'll create a Client Component with:

1. **'use client' directive**: Required at the top of the file
2. **TypeScript types**: Proper props interface
3. **React hooks**: useState, useEffect, or other hooks as needed
4. **Event handlers**: onClick, onChange, etc.
5. **Interactivity**: Browser APIs, animations, or client-side logic
6. **Styling**: TailwindCSS + Shadcn/ui components

## When to Use Client Components

Use `'use client'` when you need:
- ✅ React hooks (useState, useEffect, useCallback, etc.)
- ✅ Event handlers (onClick, onChange, onSubmit, etc.)
- ✅ Browser APIs (localStorage, window, navigator, etc.)
- ✅ Client-side state management
- ✅ Third-party libraries that depend on browser APIs
- ✅ Real-time updates (WebSockets, polling)

## Component Structure

```typescript
'use client'

import { useState } from 'react'

interface ComponentProps {
  // Props definition
}

export default function ClientComponent({ }: ComponentProps) {
  const [state, setState] = useState()

  const handleEvent = () => {
    // Event handler logic
  }

  return (
    <div>
      {/* Interactive UI */}
    </div>
  )
}
```

## DropZone Project Conventions

- **Forms**: Use react-hook-form for form handling
- **Styling**: TailwindCSS with Shadcn/ui components
- **Icons**: Use lucide-react
- **Animations**: Use framer-motion for complex animations
- **File uploads**: Use react-dropzone + UploadThing
- **Toast notifications**: Use sonner (from Shadcn/ui)

## Performance Considerations

- Keep Client Components small and focused
- Push Client Components down the tree (Server → Client boundary)
- Use React.memo() for expensive renders
- Implement proper loading states
- Handle errors with error boundaries

## Important Notes

- Minimize the use of Client Components
- Prefer Server Components when possible
- Extract interactive parts into separate Client Components
- Use Suspense boundaries for async Client Components
- Add proper accessibility attributes (ARIA labels, keyboard navigation)
