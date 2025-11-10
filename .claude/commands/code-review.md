# Code Review Assistant

Perform a comprehensive code review for $ARGUMENTS following DropZone project standards.

## Review Process

I'll analyze the code and provide feedback on:

1. **Code Quality**
   - TypeScript type safety
   - Error handling
   - Code organization and structure
   - DRY principle adherence
   - Naming conventions

2. **Next.js Best Practices**
   - Server vs Client Component usage
   - Data fetching patterns
   - API route design (POST/PUT/PATCH/DELETE only)
   - Metadata and SEO optimization
   - Performance considerations

3. **Security**
   - Authentication checks (Clerk)
   - Input validation
   - SQL injection prevention
   - Environment variable usage
   - XSS prevention

4. **Performance**
   - Bundle size impact
   - Code splitting opportunities
   - Image optimization
   - Lazy loading implementation
   - Unnecessary re-renders

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Semantic HTML
   - Color contrast
   - Screen reader compatibility

6. **Project-Specific Standards**
   - Server Components preference
   - Supabase query patterns
   - TailwindCSS + Shadcn/ui usage
   - File structure compliance

## Review Checklist

### TypeScript
- [ ] Proper type annotations
- [ ] No `any` types without justification
- [ ] Interface definitions for props
- [ ] Type safety in database queries

### Next.js
- [ ] Correct use of Server vs Client Components
- [ ] No unnecessary `'use client'` directives
- [ ] Proper async/await in Server Components
- [ ] No GET API routes (use Server Components)
- [ ] Metadata exports for SEO

### React
- [ ] Proper hook dependencies
- [ ] No unnecessary useEffect
- [ ] Memoization where needed
- [ ] Key props in lists
- [ ] Error boundaries

### Security
- [ ] Authentication checks
- [ ] Input validation
- [ ] No hardcoded secrets
- [ ] CSRF protection
- [ ] Secure database queries

### Styling
- [ ] TailwindCSS usage
- [ ] Responsive design (mobile-first for LP, desktop-first for dashboard)
- [ ] Consistent component styling
- [ ] No inline styles

## Output Format

I'll provide:
1. **Summary**: Overall code quality rating
2. **Critical Issues**: Must-fix problems
3. **Warnings**: Should-fix improvements
4. **Suggestions**: Nice-to-have enhancements
5. **Positive Points**: What's done well
6. **Refactoring Opportunities**: Code improvement ideas

## Important Notes

- Focus on actionable feedback
- Prioritize security and performance issues
- Reference DropZone coding standards
- Suggest specific improvements with examples
- Balance critique with positive reinforcement
