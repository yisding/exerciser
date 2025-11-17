# Exerciser - Bay Area Fitness Class Aggregator

A mobile-first web application that aggregates fitness class schedules from multiple fitness studios across the Bay Area, providing users with a unified view of available classes.

## 🏗️ Architecture

```
exerciser/
├── exerciser-next/          # Next.js frontend (deployed to Vercel)
├── scraper-service/         # Integration service (runs locally or on VPS)
└── shared/                  # Shared code (Prisma schema, types, utils)
```

### Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend**: Node.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (local dev → Neon production)
- **Integration**: Axios for HTTP clients, node-cron for scheduling
- **Deployment**: Vercel (frontend), VPS/Docker (scraper service)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16+
- Git

### Quick Start

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd exerciser
cd exerciser-next && npm install && cd ..
cd scraper-service && npm install && cd ..
cd shared && npm install && cd ..

# 2. Start PostgreSQL and create database
createdb exerciser

# 3. Run migrations
cd shared && npx prisma migrate dev && cd ..

# 4. Seed studios and fetch classes
cd scraper-service
npm run seed
npm run scrape:all

# 5. Start the app
cd ../exerciser-next
npm run dev
```

Visit **http://localhost:3000**!

## 📋 Features

✅ **8 Bay Area Studios** across 2 brands (Club Pilates, CycleBar)
✅ **650+ Classes** updated every 30 minutes
✅ **Mobile-First** responsive design
✅ **Smart Filtering** by brand, date, and search
✅ **Real-Time Data** from PostgreSQL database

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## 📚 Documentation

- [PLAN.md](./PLAN.md) - Detailed development roadmap
- [CLAUDE.md](./CLAUDE.md) - AI development guidelines

---

**Built for Bay Area fitness enthusiasts** 🏋️‍♀️
