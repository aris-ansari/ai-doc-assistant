# AI Document Workspace — Frontend

Next.js App Router frontend for the Enterprise AI RAG Document Workspace.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

The backend must be available at the URL configured by `NEXT_PUBLIC_API_URL`.

## Phase 7 scope

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Axios with `withCredentials: true`
- Automatic access-token refresh on protected 401 responses
- TanStack Query v5
- Auth context with `/auth/me`, login, register, logout
- Zod client-side validation
- Login and register pages
- Authenticated dashboard shell
