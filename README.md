# BorderlessCV

BorderlessCV is a production-oriented SaaS MVP for students, recent graduates, and early-career professionals applying across Ghana, the UK, the US, Canada, Europe, and remote roles.

It combines:

- authentication with Google and email/password
- onboarding and a reusable master profile
- country-aware resume creation and versioning
- AI-assisted bullet, summary, and cover-letter generation without inventing facts
- PDF export
- application tracking
- opt-in public profiles

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Prisma ORM
- PostgreSQL
- NextAuth
- OpenAI API

## Setup

1. Copy `.env.example` to `.env`.
2. Set a PostgreSQL `DATABASE_URL`.
3. Set `NEXTAUTH_SECRET`.
4. Add Google OAuth credentials if you want Google sign-in.
5. Add `OPENAI_API_KEY` for AI features.
6. Optionally add `RESEND_API_KEY` and `MAIL_FROM` for password reset email delivery.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
```

## Database

- Prisma schema: `prisma/schema.prisma`
- Initial SQL migration: `prisma/migrations/0001_init/migration.sql`

Apply migrations with:

```bash
npm run db:migrate
```

For production deployments, use:

```bash
npm run db:deploy
```

## Product Structure

- Marketing: `src/app/page.tsx`
- Auth: `src/app/(auth)`
- Onboarding: `src/app/onboarding`
- Workspace: `src/app/(app)`
- Public profile: `src/app/p/[slug]`
- API routes: `src/app/api`

## Notes

- AI prompts are explicitly constrained to transform only user-provided facts.
- Public profiles are disabled by default.
- Resume exports are generated through a server-side PDF route.

## Vercel Deployment

- Vercel is the recommended hosting target for this repo.
- Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` before the app is expected to work.
- Add `OPENAI_API_KEY`, Google OAuth values, and email values to enable AI, Google sign-in, and reset emails.
- Deployment checklist: `docs/vercel-deployment.md`
