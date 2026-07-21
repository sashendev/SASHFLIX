# AI Agent Instructions for SASHFLIX

Welcome to SASHFLIX, a free movies and TV shows streaming platform. This guide provides the essential context and conventions required to be productive in this codebase.

## 🚀 Project Overview
- **Core Stack**: Next.js 16 (App Router), Tailwind CSS 4, TypeScript, TanStack Query, Supabase, and TMDB API.
- **Purpose**: A streaming platform allowing users to discover, search, and manage a library of movies and TV shows.

## 🏗 Architecture & Patterns

### Directory Structure
- `src/app`: Next.js App Router. Pages, layouts, and API routes.
- `src/components/ui`: Atomic, reusable UI primitives.
- `src/components/sections`: Feature-specific components grouped by page (e.g., `sections/Auth`, `sections/Movie`).
- `src/api`: Third-party API clients (e.g., TMDB).
- `src/actions`: Next.js Server Actions for mutations and server-side logic.
- `src/hooks`: Custom React hooks for shared logic and data fetching.
- `src/types`: Central TypeScript definitions.
- `src/schemas`: Zod schemas for runtime validation.
- `src/utils`: Shared utility functions, environment config, and Supabase clients.

### Data Fetching & State
- **TMDB API**: Use the singleton `tmdb` client from `@/api/tmdb`.
- **Supabase**:
  - Client-side: Use `src/utils/supabase/client.ts`.
  - Server-side: Use `src/utils/supabase/server.ts`.
  - Middleware: Use `src/utils/supabase/middleware.ts`.
- **Server State**: TanStack Query is used for caching and synchronization.
- **URL State**: Use `nuqs` for type-safe search parameters.

### Configuration
- **Environment**: Access variables via `@/utils/env`.
- **Site Config**: Global constants and navigation are in `@/config/site.tsx`.

## ⚠️ Critical Pitfalls & Rules

### Next.js 16 Async Params
In Next.js 16, `params` and `searchParams` in pages and layouts are **Promises**. You must `await` them before accessing properties.
```tsx
// Correct pattern
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### Component Boundaries
- **Server vs Client**: Be mindful of the `'use client'` directive. Server Components are preferred for data fetching; Client Components for interactivity.
- **Supabase Clients**: Never use a browser client in a Server Action or a server client in a client component.

### Styling
- Use Tailwind CSS 4 utility classes.
- Follow the existing design system in `src/components/ui`.

## 🛠 Development Workflow
- **Development**: `npm run dev` (uses Turbopack).
- **Supabase Local**:
  - Start: `npm run sb-start`
  - Reset DB: `npm run sb-db-reset`
  - Sync Types: `npm run sb-db-types`

Refer to [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
