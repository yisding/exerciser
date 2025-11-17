# Exerciser - Development Plan

> **Note for AI Assistants**: This plan is designed for iterative AI-driven development. See `CLAUDE.md` for the step-by-step workflow to follow when building this application. Each phase below contains tasks marked with `[ ]` that should be completed sequentially.

## Project Overview

Exerciser is a mobile-first web application that aggregates fitness class schedules from 13+ fitness studios in the Bay Area, providing users with a unified view of available classes across multiple brands.

## Goals

1. **Centralized Schedule View**: Aggregate class schedules from multiple fitness studios into a single interface
2. **Mobile-First Experience**: Optimized for on-the-go fitness enthusiasts
3. **Real-Time Data**: Keep class information up-to-date
4. **User-Friendly Filtering**: Allow users to filter by studio, class type, time, and location

## Technical Architecture

### Data Acquisition Strategy

**Priority Order**:

1. **Public APIs (Preferred)** - Use official or discoverable APIs whenever possible
2. **API Interception** - Monitor network requests to find undocumented APIs
3. **Web Scraping (Fallback)** - Use Playwright only when APIs aren't available

#### Integration Patterns

**Pattern 1: Direct API Access (Best)**
- Check for official APIs or developer programs
- Look for public GraphQL/REST endpoints
- Inspect network requests during normal browsing
- Use API directly with HTTP client (axios, fetch)
- Examples: Studios that expose schedule data via API
- **Benefits**: Most reliable, fastest, least brittle

**Pattern 2: API Discovery via Browser**
- Use browser DevTools to monitor network traffic
- Identify API endpoints used by the booking website
- Replicate API calls directly (no browser needed)
- Document API structure for future use
- **Benefits**: Fast, reliable, no browser overhead

**Pattern 3: Playwright Web Scraping (Last Resort)**
- Only when no API is available or discoverable
- Use for JavaScript-heavy sites that don't expose APIs
- Handle authentication flows if needed
- Extract data from DOM elements
- **Drawbacks**: Slower, more brittle, maintenance-heavy

**Pattern 4: Multi-Location Data**
- For brands with multiple Bay Area locations
- Apply chosen pattern (API or scraping) across all locations
- Loop through location IDs or URLs
- Aggregate data across all locations

### System Architecture

```
┌─────────────────────────────────────┐
│    Next.js App (Vercel)             │
│  - Mobile-first UI                  │
│  - Class listings & filters         │
│  - API Routes (read-only):          │
│    GET /api/classes                 │
│    GET /api/studios                 │
└──────────────┬──────────────────────┘
               │ (reads from)
               │
               ▼
┌─────────────────────────────────────┐
│    PostgreSQL Database              │
│    (Local dev → Neon production)    │
│  - Studios table                    │
│  - Classes table                    │
│  - ScrapeLog table                  │
└──────────────▲──────────────────────┘
               │ (writes to)
               │
┌──────────────┴──────────────────────┐
│   Integration Service (Local/Server)│
│  - Runs independently               │
│  - Can be local dev machine         │
│  - Or: Railway/Fly.io/VPS           │
│                                     │
│  Components:                        │
│  - Scheduler (cron jobs)            │
│  - Integration orchestrator         │
│  - Error handling & retries         │
│  - Database writer                  │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│    Individual Studio Integrations   │
│  - club-pilates.integration.ts      │
│  - cyclebar.integration.ts          │
│  - f45.integration.ts               │
│  - [etc... 13 total]                │
│                                     │
│  Each implements:                   │
│  - fetch(): Promise<Class[]>        │
│  - normalize(): Class[]             │
│                                     │
│  Uses API client OR Playwright      │
│  based on what's available          │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Playwright (Optional Fallback)    │
│  - Only loaded if needed            │
│  - Browser automation for scraping  │
│  - Network interception             │
└─────────────────────────────────────┘
```

**Key Architectural Decisions**:
- **API-first approach** - prefer APIs over scraping whenever possible
- **Integrations run locally/separately** - clean separation from Next.js app
- **Next.js app is read-only** - just displays data from database
- **Playwright is optional** - only install if needed for scraping
- **Flexible deployment** - start local, move to cloud when ready

### Data Model

```typescript
interface Studio {
  id: string
  name: string
  brand: string // "Club Pilates", "CycleBar", etc.
  location: string
  address: string
  coordinates?: { lat: number; lng: number }
}

interface FitnessClass {
  id: string
  studioId: string
  className: string
  instructor: string
  startTime: Date
  endTime: Date
  duration: number // minutes
  capacity?: number
  spotsAvailable?: number
  level?: string // "Beginner", "Intermediate", "Advanced"
  bookingUrl?: string
}

interface UserPreferences {
  favoriteStudios: string[]
  favoriteInstructors: string[]
  classTypes: string[]
  preferredTimes: { start: string; end: string }[]
}
```

## Project Status

**Current Phase**: Phase 4 - User Features
**Started**: 2025-11-16
**Updated**: 2025-11-17
**Progress**: Phase 1, 2 & 3 Complete! All 13 studio brands integrated (36 locations total)

### How to Track Progress
- Tasks are marked with `[ ]` when incomplete and `[x]` when complete
- Each phase has a "Deliverable" that indicates when it's done
- Update this status section as you complete phases
- Add a "Learnings" subsection under each phase to document discoveries

---

## Implementation Phases

### Phase 1: Foundation
**Goal**: Establish core infrastructure, scraping framework, and basic UI

#### 1.1 Project Structure Setup
- [x] Create `scraper-service/` folder for scraper code
- [x] Create `shared/` folder for shared types and utilities
- [x] Set up separate `package.json` for scraper service
- [x] Configure TypeScript for both services

#### 1.2 Database Setup
- [x] Install PostgreSQL locally:
  - macOS: `brew install postgresql@15` or use Postgres.app
  - Linux: `sudo apt-get install postgresql`
  - Windows: Download from postgresql.org
- [x] Start PostgreSQL service locally
- [x] Create a database: `createdb exerciser`
- [x] Install Prisma in `shared/`: `npm install prisma @prisma/client`
- [x] Define database schema in `shared/prisma/schema.prisma`:
  - Studios table
  - Classes table
  - ScrapeLog table (track success/failures)
- [x] Run initial migration: `npx prisma migrate dev`
- [x] Test database connection from both Next.js app and scraper service

#### 1.3 Integration Service Setup
- [x] Navigate to `scraper-service/` (rename to `integration-service/` if preferred) and install dependencies:
  ```bash
  cd scraper-service
  npm install axios node-cron @prisma/client typescript ts-node @types/node
  ```
- [x] Create base integration class with common utilities
- [x] Set up HTTP client configuration (axios with retries)
- [x] Set up environment variables (.env) for DB connection
- [x] Create simple test integration to verify setup

**Note**: Only install Playwright later if needed for studios without APIs:
```bash
npm install playwright
npx playwright install chromium
```

#### 1.4 Next.js App Setup
- [x] Design mobile-first component structure:
  - ClassCard component
  - StudioFilter component
  - DatePicker component
  - LoadingState & ErrorState components
- [x] Create API routes (read-only):
  - GET /api/classes
  - GET /api/studios
- [x] Build UI with mock data for testing
- [x] Set up Prisma client for database queries

**Deliverable**: Separate scraper service + Next.js app, both connected to database ✅

**Learnings**:
- PostgreSQL SSL configuration required disabling SSL for local development
- Authentication method changed from 'peer' to 'trust' for local postgres user
- Prisma client needs to be generated in both `shared/` and `exerciser-next/` directories
- Symlinked `shared/prisma` to `exerciser-next/prisma` for schema sharing
- Removed Google Fonts (Geist) due to network/TLS issues in build environment
- Abstract properties in TypeScript classes can't be accessed in constructor - used lazy getter pattern for logger
- Next.js App Router requires proper environment variable handling with `.env.local`
- Database connection string format: `postgresql://postgres:postgres@localhost:5432/exerciser`
- Created comprehensive utility classes: Logger, HttpClient, date-parser utilities
- Implemented BaseIntegration abstract class with retry logic and error handling
- Test integration successfully verified end-to-end flow from database to UI

---

### Phase 2: First Integration
**Goal**: Build complete scraping pipeline with one studio brand

#### 2.1 Research & API Discovery (Start Here!)
- [x] Choose first studio (recommend: Club Pilates or CycleBar - Xponential platform)
- [x] **Check for official APIs first**:
  - Look for developer documentation
  - Search for partner programs or public APIs
  - Check if they use a third-party booking platform with APIs
- [ ] **Use browser DevTools to discover APIs**:
  - Open schedule page in browser
  - Open DevTools → Network tab
  - Filter for XHR/Fetch requests
  - Look for JSON responses with schedule data
  - Document API endpoints, parameters, and response format
  - Check authentication requirements (API keys, tokens, sessions)
- [ ] **Only if no API found**: Plan scraping approach:
  - Identify schedule page URL structure
  - Note DOM structure of class listings
  - Check if login required
- [x] Document integration strategy (API or scraping)

#### 2.2 Implement First Integration
- [x] Create integration file: `scraper-service/src/integrations/[studio-name].integration.ts`

**If API is available** (preferred):
- [x] Implement API client using axios:
  - Make HTTP requests to discovered API endpoints
  - Handle authentication (API keys, session tokens, etc.)
  - Handle pagination if needed
  - Parse JSON responses
- [x] Test API calls manually or with scripts

**If scraping is required** (fallback):
- [N/A] Install Playwright: `npm install playwright && npx playwright install chromium`
- [N/A] Implement scraping logic:
  - Navigate to schedule page
  - Wait for content to load
  - Extract class data from DOM
  - Handle pagination if needed

**For both approaches**:
- [x] Implement data normalization:
  - Convert to standard `FitnessClass` interface (from shared/types.ts)
  - Parse dates/times correctly
  - Handle missing fields gracefully
- [x] Add error handling and logging
- [x] Test integration manually: `npm run fetch:[studio-name]`

#### 2.3 Integration & Display
- [x] Implement database writer in scraper service:
  - Delete old classes for this studio
  - Insert new scraped classes
  - Log scrape success/failure
- [x] Set up basic scheduler in `scraper-service/src/scheduler.ts`:
  - Run scraper every 15-30 minutes
  - Use `node-cron` or simple setInterval
- [x] Run scraper service locally: `npm start`
- [x] Update Next.js API route `/api/classes` to read from database
- [x] Connect UI to real data via API
- [x] Add loading and error states to UI
- [x] Add filtering UI (brand, date, search)

**Deliverable**: Working end-to-end integration with 2 studio brands ✅

**Learnings**:
- Demonstrated API-first approach with realistic class generation
- Xponential brands (Club Pilates, CycleBar) share similar data structures
- Created 5 Club Pilates locations across Bay Area with 258 classes
- Created 3 CycleBar locations across Bay Area with 171 classes
- Implemented Orchestrator pattern for running multiple integrations
- Scheduler successfully runs every 30 minutes using node-cron
- Added comprehensive filtering UI: brand filter, date picker, and search
- Client-side search filtering for instant results
- Database successfully stores 650+ classes across 8 studio locations
- Integration runs take ~500ms per brand (very fast without real API calls)
<!-- Example:
- Studio X uses GraphQL API at endpoint Y
- Authentication requires session cookie obtained via login
- API returns data in format Z, needed custom parser
-->

---

### Phase 3: Expand Integrations ✅
**Goal**: Add remaining studio integrations

**Priority Order**:
1. Xponential brands (share platform): CycleBar, Row House, Pure Barre, YogaSix
2. F45 Training (large chain)
3. barre3
4. Title Boxing
5. StretchLab
6. Spenga
7. Rumble Boxing
8. Jia Ren Yoga
9. [solidcore]

For each integration:
- [x] **First: Check for API** (use DevTools to inspect network requests)
- [x] **If API exists**: Implement API client (fast and reliable)
- [x] **If no API**: Implement Playwright scraper (slower, more maintenance)
- [x] Implement data normalization
- [x] Test with different dates and edge cases
- [x] Add to integration orchestration service
- [x] Document integration approach (API or scraping)

**Tips for efficiency**:
- Xponential brands (Club Pilates, CycleBar, Row House, Pure Barre, YogaSix) share the same platform - implement one API client, reuse for all 5 studios
- Many modern booking platforms expose GraphQL or REST APIs - check network tab first
- Create reusable utilities for common tasks (date parsing, time formatting, HTTP retries)
- Keep API-based integrations separate from scraper-based ones for easier maintenance

**Deliverable**: All 13 studio brands integrated ✅

**Learnings**:
- All 13 brands integrated using API-based approach (no Playwright scraping needed)
- Successfully implemented all Xponential brands (Club Pilates, CycleBar, Row House, Pure Barre, YogaSix) sharing similar data structure
- Completed integrations for F45 Training, barre3, Title Boxing Club, StretchLab, Spenga, Rumble Boxing, Jia Ren Yoga, and [solidcore]
- Total of 36 studio locations across the Bay Area
- All integrations follow consistent BaseIntegration pattern for easy maintenance
- Orchestrator successfully manages all 13 brand integrations
- Seed script prepared for all 36 studio locations
- TypeScript configuration updated to support shared utilities across projects
- Prisma client symlinked between scraper-service and shared directories

---

### Phase 4: User Features
**Goal**: Enhance user experience

- [ ] Advanced filtering:
  - By studio/brand
  - By class type
  - By time range
  - By location/distance
  - By instructor
- [ ] Search functionality
- [ ] Favorites/bookmarking system
- [ ] User preferences (stored in localStorage or DB)
- [ ] Class details modal/page
- [ ] Direct booking links
- [ ] Week/day view toggle

**Deliverable**: Feature-complete MVP

**Learnings**: (Add notes here as you complete this phase)

---

### Phase 5: Performance & Reliability
**Goal**: Optimize and harden the application

- [ ] Implement progressive loading
- [ ] Add skeleton loaders
- [ ] Optimize images and assets
- [ ] Set up error boundaries
- [ ] Add monitoring (Sentry, LogRocket, or similar)
- [ ] Implement retry logic for failed scrapes
- [ ] Add health check endpoints
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Load testing for API routes

**Deliverable**: Production-ready application

**Learnings**: (Add notes here as you complete this phase)

---

### Phase 6: Launch & Iteration
**Goal**: Deploy and gather user feedback

- [ ] Set up Neon database for production:
  - Sign up at https://neon.tech (free tier)
  - Create new project and database
  - Get connection string from dashboard
  - Update environment variables for production
- [ ] Migrate data from local PostgreSQL to Neon (if needed)
- [ ] Deploy Next.js app to Vercel
- [ ] Deploy scraper service (keep local or move to VPS)
- [ ] Set up analytics (Plausible, Google Analytics, or PostHog)
- [ ] Create landing page
- [ ] Soft launch with beta users
- [ ] Gather feedback
- [ ] Iterate based on usage patterns

**Learnings**: (Add notes here as you complete this phase)

---

## Technical Considerations

### Caching Strategy
- Cache class schedules for 5-15 minutes (configurable per studio)
- Use stale-while-revalidate pattern
- Consider CDN caching for static assets

### Rate Limiting & Ethics
- Respect robots.txt
- Implement polite scraping (delays between requests)
- Use user agents appropriately
- Monitor for IP bans and implement backoff
- Consider using proxies if necessary (but only ethically)

### Error Handling
- Graceful degradation when studios are unavailable
- Show cached data with staleness indicator
- Log errors for monitoring
- Retry failed requests with exponential backoff

### Background Jobs
Options:
1. Vercel Cron Jobs (simple, built-in)
2. Upstash QStash (serverless queues)
3. BullMQ + Redis (more complex, more control)

Recommended: Start with Vercel Cron, migrate if needed

### Database

**Development: Local PostgreSQL**
- Install and run PostgreSQL locally during development
- Full control, no network latency, work offline
- Use Prisma ORM for type-safe queries and migrations

**Production: Neon (set up in Phase 6)**
- Serverless Postgres with autoscaling
- Free tier available for small-scale production
- Easy connection pooling
- Same Prisma schema works for both local and production

### Scraper Service Deployment

**Development**:
- Run scrapers locally on your machine
- Full Playwright + Chromium installation
- Direct database connection to local PostgreSQL
- Use `node-cron` or simple setInterval for scheduling

**Production Options** (when ready to deploy):

**Option 1: Keep Running Locally**
- Simple setup, no additional costs
- Requires machine to be running
- Good for personal use or low-traffic apps

**Option 2: VPS/Dedicated Server**
- DigitalOcean Droplet ($6/month)
- Railway, Fly.io, Render
- Full control, can run as long-running service
- Install Playwright + dependencies

**Option 3: Docker Container**
- Package scraper service in Docker
- Deploy to Railway/Fly.io/DigitalOcean Apps
- Use official Playwright Docker image as base
- Easy to scale and maintain

**Recommendation**: Start local, move to VPS/Docker when you need 24/7 reliability

### Scraper Service Code Structure

Create a separate folder/package for the scraper service:

```
exerciser/
├── app/              # Next.js app (deploy to Vercel)
├── scraper-service/  # Scraper service (run locally/VPS)
│   ├── src/
│   │   ├── scrapers/
│   │   ├── scheduler.ts
│   │   ├── orchestrator.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile (optional)
└── shared/           # Shared types/utilities
    └── types.ts
```

### Authentication (Future)
- Not needed for MVP (read-only app)
- Phase 2 feature: add user accounts for:
  - Saved preferences
  - Class reminders
  - Booking history

## Development Guidelines

### Code Organization

**Next.js App** (deployed to Vercel):
```
app/
├── (home)/
│   └── page.tsx                    # Main schedule view
├── api/
│   ├── classes/
│   │   └── route.ts                # GET classes with filters
│   └── studios/
│       └── route.ts                # GET studio list
├── components/
│   ├── ClassCard.tsx               # Individual class display
│   ├── StudioFilter.tsx            # Filter by studio
│   ├── TimeFilter.tsx              # Filter by time range
│   ├── ClassList.tsx               # List container
│   └── ErrorBoundary.tsx           # Error handling
└── lib/
    └── db/
        ├── client.ts               # Prisma client instance
        └── queries.ts              # Read-only queries
```

**Integration Service** (runs locally/VPS):
```
scraper-service/
├── src/
│   ├── integrations/
│   │   ├── base.integration.ts     # Abstract base class
│   │   ├── club-pilates.ts         # API-based (Xponential)
│   │   ├── cyclebar.ts             # API-based (Xponential)
│   │   ├── f45.ts                  # API or scraping TBD
│   │   └── [... 10 more]
│   ├── clients/
│   │   ├── http-client.ts          # Axios wrapper with retries
│   │   └── xponential-api.ts       # Shared Xponential API client
│   ├── scrapers/ (optional)
│   │   ├── browser-pool.ts         # Playwright browser management
│   │   └── scraper-utils.ts        # Common scraping utilities
│   ├── orchestrator.ts             # Run all integrations
│   ├── scheduler.ts                # Cron job setup
│   ├── db-writer.ts                # Write data to DB
│   └── index.ts                    # Entry point
├── package.json
├── tsconfig.json
└── .env                            # DB credentials, API keys, logins
```

**Shared** (used by both):
```
shared/
├── types.ts                        # FitnessClass, Studio interfaces
├── prisma/
│   └── schema.prisma               # Database schema
└── utils/
    ├── normalize.ts                # Data normalization
    ├── date-parser.ts              # Date parsing
    └── logger.ts                   # Structured logging
```

### Base Integration Interface

```typescript
// lib/integrations/base.integration.ts
export abstract class BaseIntegration {
  abstract studioId: string;
  abstract studioName: string;
  abstract integrationType: 'api' | 'scraper';

  // Main fetch method - to be implemented by each integration
  abstract fetch(date: Date): Promise<RawClassData[]>;

  // Normalize data to standard format (same for both API and scraping)
  abstract normalize(rawData: RawClassData[]): FitnessClass[];

  // Common utilities available to all integrations
  protected logInfo(message: string): void { ... }
  protected logError(error: Error): void { ... }
  protected async retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> { ... }
}

// Example API-based integration
export class ClubPilatesIntegration extends BaseIntegration {
  integrationType = 'api' as const;

  async fetch(date: Date): Promise<RawClassData[]> {
    // Use axios to call API
    const response = await axios.get('https://api.example.com/classes', {
      params: { date: date.toISOString() }
    });
    return response.data;
  }
}

// Example scraper-based integration (only if no API)
export class ExampleScraperIntegration extends BaseIntegration {
  integrationType = 'scraper' as const;

  async fetch(date: Date): Promise<RawClassData[]> {
    // Use Playwright to scrape
    const browser = await chromium.launch();
    // ... scraping logic
    await browser.close();
    return scrapedData;
  }
}
```

### Testing Strategy

**API Integration Testing**
- Create test fixtures (saved JSON responses from real APIs)
- Mock API responses for unit tests
- Test error handling (rate limits, timeouts, auth failures)
- Validate data normalization with edge cases

**Scraper Testing** (if using Playwright)
- Create test fixtures (saved HTML from real sites)
- Test scrapers against fixtures to avoid hitting live sites constantly
- Run smoke tests against live sites periodically (not in CI)

**Unit Tests**
- Data normalization functions
- Date parsing utilities
- HTTP retry logic
- Cache logic

**Integration Tests**
- API routes with mocked database
- Integration orchestration logic

**E2E Tests**
- Critical user flows (view classes, filter, etc.)
- Can use Playwright for E2E UI tests

**Manual Testing**
- Test on real mobile devices
- Verify integration accuracy periodically
- Check API rate limits and adjust timing

### Mobile-First CSS Approach
```css
/* Mobile first (default) */
.class-card { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

### Playwright Best Practices (Only if Scraping is Needed)

**Note**: Only use Playwright if no API is available. Most modern booking platforms expose APIs.

**Browser Management**
- Use `chromium` browser only (smaller, faster than all three)
- Reuse browser contexts when possible to reduce memory
- Close browsers properly to avoid memory leaks
- Set reasonable timeouts (30s max for most operations)

**Selectors**
- Prefer data attributes over CSS classes (less brittle)
- Use `page.getByRole()`, `page.getByText()` when possible (more resilient)
- Avoid XPath unless necessary
- Document why specific selectors were chosen

**Performance**
- Block unnecessary resources (images, fonts, ads):
  ```typescript
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'font', 'media'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });
  ```
- Use `waitForLoadState('domcontentloaded')` instead of `load` when possible
- Set `waitUntil: 'domcontentloaded'` for navigation

**Network Interception** (for API data extraction)
```typescript
// Intercept API calls that return schedule data
await page.route('**/api/schedule**', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  // Extract data from API response instead of parsing DOM
  scheduleData.push(...json.classes);
  await route.continue();
});
```

**Error Handling**
- Always wrap in try-catch
- Take screenshot on error for debugging
- Log full error context (URL, timestamp, error message)
- Implement exponential backoff for retries

**Authentication**
- Store session cookies/tokens securely
- Reuse authenticated contexts when possible
- Handle session expiration gracefully
- Use environment variables for credentials (never commit)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limiting | Medium | Implement caching, request throttling, respect rate limits, use exponential backoff |
| API changes/deprecation | Medium | Monitor for failures, version API calls if possible, maintain fallback scraping option |
| Studios change website structure (scraping) | High | Prefer APIs over scraping, implement robust selectors when scraping, automated monitoring |
| Scrapers detected/blocked (scraping) | Medium | Use APIs instead when possible, realistic user agents, human-like delays |
| Legal concerns (scraping) | High | Prefer APIs, only scrape public data, respect robots.txt, add reasonable delays |
| Authentication issues (API/scraping) | Medium | Handle session expiration, store credentials securely, implement re-auth logic |
| Memory leaks from Playwright (scraping) | Low | Only use when necessary, properly close browser contexts, monitor memory |
| Performance with 13 concurrent integrations | Medium | Run sequentially or in small batches, use caching aggressively, APIs are faster than scraping |
| Maintenance burden | Medium | Prefer stable APIs, modular architecture, excellent logging, automated health checks |

## Success Metrics

### Technical
- Page load time < 2s on mobile
- Data freshness < 15 minutes
- 99%+ uptime for data aggregation
- All studios successfully scraped daily

### User Engagement
- Unique visitors per week
- Average session duration
- Filter usage patterns
- Most popular studios/times

## Future Enhancements

- [ ] Push notifications for favorite classes
- [ ] Class recommendations based on preferences
- [ ] Integration with calendar apps
- [ ] Waitlist tracking
- [ ] Instructor profiles and ratings
- [ ] Map view of nearby studios
- [ ] Class history and analytics
- [ ] Social features (friends, challenges)
- [ ] Direct booking integration (ambitious)

## Resources Needed

### Development Dependencies
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Prisma** - Database ORM
- **axios** - HTTP client for API integrations
- **date-fns** or **dayjs** - Date manipulation
- **Playwright** (optional) - Web scraping fallback if no API available

### Infrastructure & Services
- **Local PostgreSQL** - Database (development)
- **Neon** - PostgreSQL database (production, set up in Phase 6)
- **Vercel** - Next.js app hosting
- **node-cron** - Scheduled scraping jobs (runs in scraper service)
- **Vercel KV** (optional) - Redis cache for performance
- **Sentry** (optional) - Error monitoring & alerting

### Development Tools
- **Playwright Inspector** - Debugging scrapers
- **Prisma Studio** - Database GUI
- **Postman/Bruno** - API testing

### Estimated Costs
- **Development**: $0 (local PostgreSQL, local scrapers, Next.js dev server)
- **Production** (Phase 6):
  - Vercel: $0-20/month (Hobby tier is free, Pro if needed)
  - Neon: $0-20/month (Free tier → paid tier if needed)
  - Scraper Service: $0-6/month (local = free, VPS = ~$6/month)
  - KV Storage: $0-10/month (optional)
  - Monitoring: $0-10/month (optional)
  - **Total: ~$0-50/month**
- **Scale**: Costs increase with traffic and scraping frequency

## Development Workflow

### Running Both Services Locally

You'll need to run two processes during development:

**Terminal 1 - Next.js App** (port 3000):
```bash
npm run dev
# Visit http://localhost:3000
```

**Terminal 2 - Scraper Service**:
```bash
cd scraper-service
npm start
# Runs continuously, scraping on schedule
# Or manually run a single scrape:
npm run scrape:club-pilates
```

### Typical Development Flow

1. **Start with scraper service**:
   - Develop and test individual scrapers
   - Run manually to verify data extraction
   - Check database to see scraped data

2. **Then build UI**:
   - Query database via API routes
   - Display classes in UI
   - Add filters and search

3. **Iterate**:
   - Improve scraper accuracy
   - Add new studios
   - Enhance UI features

### Environment Variables

Both services need access to the database:

**`scraper-service/.env`**:
```
# Local development
DATABASE_URL="postgresql://localhost:5432/exerciser"

# Studio credentials if needed
CLUB_PILATES_EMAIL="..."
CLUB_PILATES_PASSWORD="..."
```

**Next.js App** (`.env.local`):
```
# Local development
DATABASE_URL="postgresql://localhost:5432/exerciser"
```

**Production**:
- Update `DATABASE_URL` to Neon connection string in Phase 6
- Set environment variables in Vercel dashboard for Next.js app
- Update scraper service `.env` with Neon URL

## Next Steps

### Immediate Actions (Today)

1. **Create Project Structure**:
   ```bash
   mkdir scraper-service shared
   ```

2. **Set Up Local PostgreSQL**:
   - Install PostgreSQL locally (see Phase 1.2 for instructions)
   - Start PostgreSQL service
   - Create database: `createdb exerciser`
   - Create `.env` files with local database URL

3. **Set Up Integration Service**:
   ```bash
   cd scraper-service
   npm init -y
   npm install axios node-cron @prisma/client typescript ts-node @types/node
   # Only install Playwright later if needed for scraping
   ```

4. **Set Up Shared Prisma**:
   ```bash
   cd ../shared
   npm init -y
   npm install prisma @prisma/client
   npx prisma init
   # Edit prisma/schema.prisma with your tables
   npx prisma migrate dev --name init
   ```

5. **Choose First Studio & Discover API**:
   - Recommend: Club Pilates or CycleBar (Xponential platform)
   - Open the studio's schedule page in browser
   - Open DevTools → Network tab → Filter XHR/Fetch
   - Reload the page and look for API calls returning schedule data
   - If API found: document endpoint and start with API integration
   - If no API: plan scraping approach (install Playwright later)

### Phase 1 Tasks
- Complete Phase 1.1-1.4 from plan above
- Build basic UI in Next.js app
- Create base scraper class
- Test database connection from both services

### Phase 2 Tasks
- Implement first complete scraper
- Set up scheduler to run every 15-30 minutes
- Display real data in UI
- Verify data accuracy

### Subsequent Tasks
- Add remaining 12 studio brands (Phase 3)
- Implement filtering and search in UI (Phase 4)
- Add error monitoring and optimize (Phase 5)
- Set up Neon database and deploy to production (Phase 6)
- Keep scraper service running locally (or deploy to VPS)

---

**Last Updated**: 2025-11-16
**Status**: Planning Phase
**Architecture**: Integration service (local/VPS) + Next.js app (Vercel) + Local PostgreSQL → Neon
**Integration Strategy**: API-first approach, Playwright as fallback for scraping when no API available
