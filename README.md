# Next.js Application

A full-stack Next.js application built with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
bash scripts/init-db.sh

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router (pages, layouts, API routes)
│   ├── api/             # API route handlers
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable React components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and shared logic
│   ├── db.ts            # PostgreSQL connection pool
│   ├── prisma.ts        # Prisma client singleton
│   ├── utils.ts         # General utilities (cn helper)
│   ├── api.ts           # Fetch API wrapper
│   ├── api-response.ts  # Standard API response helpers
│   └── validators.ts    # Zod validation schemas
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware
```

## API Endpoints

| Method | Path                 | Description           |
|--------|----------------------|-----------------------|
| GET    | `/api/health`        | Basic health check    |
| GET    | `/api/health/live`   | Liveness probe        |
| GET    | `/api/health/ready`  | Readiness probe (+ DB)|
| GET    | `/api/health/startup`| Startup probe         |
| GET    | `/api/users`         | List all users        |
| POST   | `/api/users`         | Create a user         |
| GET    | `/api/users/:id`     | Get user by ID        |
| PUT    | `/api/users/:id`     | Update user           |
| DELETE | `/api/users/:id`     | Delete user           |

## Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Apply raw SQL schema
bash scripts/init-db.sh
```

## Environment Variables

| Variable               | Description              | Default            |
|------------------------|--------------------------|--------------------|
| `NEXT_PUBLIC_APP_URL`  | Public app URL           | http://localhost:3000 |
| `DB_HOST`              | PostgreSQL host          | localhost          |
| `DB_PORT`              | PostgreSQL port          | 5432               |
| `DB_USER`              | PostgreSQL user          | postgres           |
| `DB_PASSWORD`          | PostgreSQL password      | -                  |
| `DB_NAME`              | PostgreSQL database name | app_db             |
