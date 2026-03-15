# Deploying BorderlessCV on Vercel

This project is ready to deploy on Vercel, but it will not be usable until the required environment variables and database are configured.

## Recommended setup

- Production branch: `master`
- Review environment: Vercel Preview Deployments for feature work
- Database: hosted PostgreSQL
- First production migration command: `npm run db:deploy`

## Before the first deploy

1. Import the GitHub repo into Vercel.
2. Keep the framework preset as `Next.js`.
3. Add a hosted PostgreSQL database.
4. Add the required environment variables in Vercel.
5. Trigger the first deployment.
6. Run `npm run db:deploy` against the production database before using the app.

## Required environment variables

Add these in both `Preview` and `Production` unless noted otherwise:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Optional but strongly recommended:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Environment notes

### `NEXTAUTH_URL`

Set this to the exact public URL for the environment:

- Production example: `https://your-app.vercel.app`
- Staging example: `https://staging.your-domain.com`

For OAuth, fixed URLs are better than random preview URLs.

### Google OAuth

Google sign-in should only be enabled after its callback URLs are configured in Google Cloud. Add one callback URL per stable environment:

- `https://your-production-domain/api/auth/callback/google`
- `https://your-staging-domain/api/auth/callback/google`

If those values are missing, BorderlessCV will fall back to email/password only.

### Password reset email

Password reset email delivery requires:

- `RESEND_API_KEY`
- `MAIL_FROM`

Without them, the forgot-password flow will not send production email.

## Database deployment

Use Prisma migrations for production:

```bash
npm run db:deploy
```

Do not use `npm run db:migrate` in production. That command is for local development only.

For Supabase with Prisma on Vercel:

- `DATABASE_URL` should use the transaction pooler
- `DIRECT_URL` should use the session pooler or direct connection

## Operational recommendation

Use one stable non-production URL for review, especially if you want Google sign-in to work consistently. Random preview URLs are fine for UI checks, but a stable staging domain is better for end-to-end product validation.
