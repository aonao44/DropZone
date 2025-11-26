# CLAUDE.md - DropZone Project

This file provides guidance to Claude Code (claude.ai/code) when working with the DropZone codebase.

## Project Overview

**DropZone** is a modern file-sharing service built with Next.js that allows clients to create projects and receive file submissions from designers. The application features a client dashboard, designer-friendly file submission forms, and secure file management with UploadThing and Supabase.

### Key Features
- Client dashboard for project management
- Designer-friendly file submission interface
- Secure authentication with Clerk
- File storage and management with UploadThing
- Database powered by Supabase
- Real-time submission tracking
- Batch file downloads with ZIP generation

## Development Commands

### Available Scripts
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run lint` - Run Next.js ESLint

### Important Notes
- ⚠️ **No test framework configured** - Tests are not currently implemented
- ⚠️ **No Prettier configured** - Code formatting is manual
- ✅ **TypeScript strict mode enabled** - Type safety is enforced

## Technology Stack

### Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5** - Static type checking

### Authentication & Database
- **Clerk 6.12.12** - User authentication and management
- **Supabase** - PostgreSQL database with real-time capabilities
  - `@supabase/supabase-js` - JavaScript client
  - `@supabase/ssr` - Server-side rendering support

### File Management
- **UploadThing 7.6.0** - File upload service with signed URLs
- **react-dropzone** - Drag & drop file uploader
- **browser-image-compression** - Client-side image optimization
- **archiver** - ZIP file generation for batch downloads

### UI Components
- **Shadcn/ui + Radix UI** - Accessible component library
- **TailwindCSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **next-themes** - Dark/light theme support

### Form & Data
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation
- **zod** - Schema validation
- **date-fns** - Date manipulation
- **axios** - HTTP client

## Project Structure

```
DropZone/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (POST/PUT/PATCH/DELETE only)
│   │   ├── projects/            # Project CRUD operations
│   │   ├── submissions/         # Submission management
│   │   ├── download-all/        # Batch download endpoint
│   │   └── uploadthing/         # File upload configuration
│   ├── dashboard/               # Client dashboard (auth required)
│   │   ├── new/                # New project creation
│   │   └── page.tsx            # Dashboard home
│   ├── project/[slug]/          # Dynamic project routes
│   │   ├── submit/             # Designer submission form (public)
│   │   └── view/               # Submission viewer (auth required)
│   ├── sign-in/                 # Clerk sign-in page
│   ├── sign-up/                 # Clerk sign-up page
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   ├── client-submission-form.tsx
│   ├── DashboardClient.tsx
│   ├── ProjectDetailClient.tsx
│   └── ...
├── lib/                          # Utilities and configurations
│   ├── supabase/
│   │   └── server.ts            # Supabase server client
│   ├── types.ts                 # TypeScript type definitions
│   ├── uploadthing.ts           # UploadThing configuration
│   └── utils.ts                 # Utility functions
├── hooks/                        # Custom React hooks
├── utils/                        # Helper functions
└── public/                       # Static assets
```

## Development Guidelines

### Server Components First (Critical)
- **Default to Server Components** - Use Server Components by default
- **Minimize `'use client'`** - Only use when absolutely necessary:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Client-side state management

### Data Fetching Strategy
- ✅ **Use Server Components for data fetching** - Fetch directly in components
- ❌ **DO NOT create GET API routes** - This is a critical project rule
- ✅ **API routes only for mutations** - POST, PUT, PATCH, DELETE only
- ✅ **Server Actions are preferred** - For form submissions and mutations

### API Route Conventions
**IMPORTANT**: In this project, we avoid GET API routes entirely.
- ✅ POST - Create resources
- ✅ PUT - Replace resources
- ✅ PATCH - Update resources
- ✅ DELETE - Remove resources
- ❌ GET - Use Server Components instead

### TypeScript Standards
- **Strict mode enabled** - All type errors must be resolved
- **Interfaces over types** - Use interfaces for object shapes
- **Avoid enums** - Use objects or union types instead
- **No `any` types** - Use `unknown` or proper types
- **Path aliases** - Use `@/` prefix (e.g., `@/components/ui/button`)

### Styling Guidelines
- **TailwindCSS** - Utility-first approach
- **Shadcn/ui** - Use for all UI components
- **Responsive Design**:
  - Landing page: Mobile-first approach
  - Dashboard: Desktop-first approach
- **No inline styles** - Use Tailwind classes
- **Dark mode support** - Use next-themes

### Component Naming
- **Server Components**: Default export, PascalCase filename
- **Client Components**: `'use client'` directive, default export
- **UI Components**: Place in `components/ui/`
- **Page Components**: Use `page.tsx` in route folders

### Database Patterns (Supabase)
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
```

### Authentication (Clerk)
```typescript
// Server Component
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) redirect('/sign-in')
```

### File Uploads (UploadThing)
- Use `@uploadthing/react` for components
- Configure endpoints in `app/api/uploadthing/`
- Store file metadata in Supabase

## Security Practices

### Environment Variables
Required variables (see `.env.example`):
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `UPLOADTHING_SECRET` - UploadThing secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Security Checklist
- ✅ Authentication checks on protected routes
- ✅ Input validation with Zod
- ✅ Server-side validation for all mutations
- ✅ No secrets in client-side code
- ✅ Supabase RLS policies enabled

## Performance Optimization

### Next.js Optimizations
- Use Server Components for static content
- Implement Suspense boundaries for loading states
- Use `next/image` for image optimization
- Enable dynamic imports for heavy components
- Optimize bundle size with tree-shaking

### React Best Practices
- Minimize `useEffect` usage
- Use `React.memo()` for expensive components
- Implement proper key props in lists
- Avoid prop drilling (use context when needed)

## Accessibility Requirements

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

## UI/UX Change Policy

⚠️ **IMPORTANT**: Do not make UI/UX changes without explicit approval
- Layout modifications require approval
- Color scheme changes require approval
- Font and spacing changes require approval
- Always ask before changing design elements

## Git Workflow

### Commit Message Format (Conventional Commits)
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: restructure code
chore: update dependencies
test: add tests
```

### Branch Strategy
- `main` - Production branch
- Feature branches - Use descriptive names
- No direct commits to `main`

## Common Patterns

### Creating a New Page
1. Create `page.tsx` in appropriate `app/` folder
2. Use Server Component by default
3. Add metadata exports for SEO
4. Implement error.tsx and loading.tsx if needed

### Adding a New Component
1. Determine if Server or Client Component
2. Place in appropriate folder (`components/` or `components/ui/`)
3. Use TypeScript interfaces for props
4. Apply TailwindCSS styling
5. Ensure accessibility

### Creating an API Route
1. Create route.ts in `app/api/`
2. Implement only POST/PUT/PATCH/DELETE
3. Add authentication checks
4. Validate input with Zod
5. Handle errors properly

### Database Operations
1. Use `createClient()` from `@/lib/supabase/server`
2. Always check for errors
3. Use TypeScript types from `@/lib/types`
4. Respect RLS policies

## Available Claude Code Commands

Use these slash commands for common tasks:

- `/component <name>` - Create React component
- `/nextjs-page <path>` - Create Next.js page
- `/server-component <name>` - Create Server Component
- `/client-component <name>` - Create Client Component
- `/api-route <path>` - Create API route (POST/PUT/PATCH/DELETE)
- `/hooks <name>` - Create custom React hook
- `/supabase-query <table>` - Generate Supabase query
- `/code-review <file>` - Review code quality
- `/lint <path>` - Run linter and fix issues
- `/refactor <file>` - Refactor code

## Troubleshooting

### Common Issues
- **Build errors**: Check TypeScript types, run `npm run build`
- **Auth issues**: Verify Clerk environment variables
- **Database errors**: Check Supabase connection and RLS policies
- **Upload failures**: Verify UploadThing configuration

### Debug Mode
```bash
# Enable verbose logging
NODE_OPTIONS='--inspect' npm run dev

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [UploadThing Documentation](https://docs.uploadthing.com)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Project Status

- ✅ Core functionality implemented
- ✅ Authentication working
- ✅ File uploads functional
- ✅ Database integrated
- ⚠️ Tests not implemented
- ⚠️ Code formatting not automated
- 🚧 Dark mode partially implemented
