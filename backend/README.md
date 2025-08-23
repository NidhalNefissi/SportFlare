````markdown
```markdown
# SportFlare Backend (scaffold)

This directory contains a minimal, production-ready TypeScript Express scaffold with:
- environment validation (zod)
- centralized error handling
- async route wrapper
- health endpoint
- Dockerfile
- example .env

Quick start:
1. Copy `.env.example` to `.env` and fill values.
2. From backend/ run:
   - npm install
   - npm run dev         # development (ts-node-dev)
   - npm run build       # compile to dist
   - npm start           # run compiled build

Next responsibilities:
- Add database integration (Prisma / TypeORM / Sequelize) or adjust DATABASE_URL usage.
- Add authentication (JWT) using JWT_SECRET.
- Add routes/controllers/services for domain logic (users, classes, bookings, payments).
- Add tests and CI workflow.
- Configure secrets in your deployment environment (do not commit .env).

If you'd like, I can add Prisma schema, authentication routes, sample domain endpoints, GitHub Actions, and a PR with the scaffold applied.
```
````