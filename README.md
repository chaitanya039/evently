# 🎟️ Evently – Scalable Event Ticketing Backend

Evently is a **scalable and performant event ticketing platform** built with Node.js.  
It supports **user bookings, waitlists, real-time availability, notifications, caching, and analytics**.

## Features
- JWT auth, role-based access (User/Admin)
- Events CRUD
- Concurrency-safe bookings (Redis)
- Waitlist promotion via BullMQ
- Notifications via job queues
- Analytics (top events, daily counts)
- Redis caching with namespace invalidation
- Bull Board admin UI at `/api/v1/admin/queues`

## Tech
Node.js, Express, Sequelize (Postgres), Redis, BullMQ, JWT

## HLD & ER
Add architecture images into `/docs`:
- `docs/architecture-hld.png`
- `docs/er-diagram.png`

## Setup
1. Copy `.env.example` -> `.env`, update values.
2. `npm install`
3. Start Redis & Postgres locally.
4. `npm run dev`
5. Visit `http://localhost:5000/api/v1/admin/queues` for queue UI.

## Postman
Import `docs/Evently.postman_collection.json`.

## License
MIT