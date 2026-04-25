# Poll Party Awards

## Backend setup (Prisma + dual DB)

1. Copy `.env.example` to `.env` for local SQLite.
2. Run `npm run prisma:generate`.
3. Run `npm run prisma:migrate:dev` (or `npm run prisma:push`).
4. Run `npm run dev`.

`npm run dev` starts:

- Vite frontend (`http://localhost:8080`)
- Next API server (`http://localhost:3001`)

Vite proxies `/api/*` to the Next server automatically.

## App navigation

- `/` homepage with:
  - create new poll action
  - open poll/dashboard by ID
  - list of completed polls to open dashboards
- `/create` create poll form
- `/poll/:id` poll lobby
- `/dashboard/:id` results dashboard

For production, set:

- `DB_PROVIDER="postgresql"`
- `DATABASE_URL="postgresql://..."`

and run `npm run prisma:generate` during build/deploy.

## Note about provider switching

Prisma does not currently allow `provider = env("DB_PROVIDER")` directly in `schema.prisma`.
This project uses `npm run prisma:sync` to generate `prisma/schema.prisma` from `prisma/schema.template.prisma`
based on `DB_PROVIDER` (`sqlite` or `postgresql`), then runs Prisma commands on that generated schema.

## API routes

- `POST /api/poll/create`
- `POST /api/poll/validate`
- `GET /api/poll/[id]`
- `POST /api/poll/submit`
- `POST /api/poll/close`
- `GET /api/poll/results/[id]`
