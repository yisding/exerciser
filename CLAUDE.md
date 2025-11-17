# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Exerciser** is a mobile-first web application for aggregating fitness schedules from multiple fitness studios in the Bay Area. The app consolidates class schedules from various studios including Club Pilates, CycleBar, Row House, F45, Spenga, YogaSix, Title Boxing, barre3, Pure Barre, StretchLab, Rumble Boxing, and [solidcore].

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **TypeScript**: Strict mode enabled
- **Fonts**: Geist Sans and Geist Mono (via next/font)

## Project Structure

```
exerciser-next/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout with font configuration
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles and Tailwind imports
├── public/           # Static assets (SVG files)
└── [config files]    # Various configuration files
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Configuration Details

### TypeScript
- Path alias: `@/*` maps to project root
- Target: ES2017
- Strict mode enabled
- JSX: react-jsx (React 19+)

### Tailwind CSS
- Using Tailwind CSS v4 with PostCSS plugin
- Custom CSS variables for theming:
  - `--background` and `--foreground` for light/dark mode
  - Custom fonts via CSS variables (`--font-geist-sans`, `--font-geist-mono`)
- Dark mode via `prefers-color-scheme` media query

### ESLint
- Using Next.js recommended configs (core-web-vitals + TypeScript)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Architecture Notes

### Current State
This is a freshly bootstrapped Next.js project. The actual fitness schedule aggregation features have not been implemented yet.

### Planned Features
The application will need to integrate with multiple fitness studio booking platforms:
- Club Pilates (members.clubpilates.com)
- CycleBar (members.cyclebar.com)
- Row House (members.therowhouse.com)
- F45 Training (f45training.com)
- Spenga (spenga.com)
- YogaSix (members.yogasix.com)
- Title Boxing (titleboxing.myperformanceiq.com)
- barre3 (barre3.com)
- Pure Barre (members.purebarre.com)
- StretchLab (stretchlab.com)
- Rumble Boxing (rumbleboxinggym.com)
- Jia Ren Yoga (vagaro.com)
- [solidcore] (solidcore.co)

Each platform likely requires different scraping/API integration approaches.

### Mobile-First Design
The application is designed to be mobile-first, as indicated by the README. When implementing features, prioritize mobile layouts and responsive design patterns.

## Development Workflow for AI Assistants

This project is designed to be built iteratively with AI assistance. Follow this workflow for each development cycle:

### Step 1: Find Next Work
1. Read `PLAN.md` to understand the current phase and overall architecture
2. Look for the next unchecked `[ ]` task in the current phase
3. If all tasks in current phase are complete, move to next phase
4. If unclear what to work on, ask the user for direction

### Step 2: Implement with Tests
1. Implement the feature/task following the architecture in `PLAN.md`
2. Write test cases for the implementation:
   - Unit tests for utility functions
   - Integration tests for API routes
   - If implementing an integration: test data normalization and error handling
3. Follow existing code style and patterns
4. Add clear comments for complex logic

### Step 3: Verify Tests Pass
1. Run the test suite: `npm test` (or equivalent)
2. Fix any failing tests
3. Ensure new code has adequate test coverage
4. Run tests for affected areas, not just new code

### Step 4: Verify Deployment Works
1. For Next.js app changes:
   - Run `npm run build` to ensure production build succeeds
   - Verify no build errors or warnings
2. For integration service changes:
   - Test that the integration can connect to database
   - Verify environment variables are documented
3. Check that all dependencies are properly listed in `package.json`

### Step 5: Verify Linting Passes
1. Run `npm run lint` to check code quality
2. Fix any linting errors
3. Ensure TypeScript has no type errors: `npx tsc --noEmit`
4. Follow the project's code style conventions

### Step 6: Update PLAN.md
1. Mark the completed task as done: `[x]`
2. Add a "Learnings" or "Notes" section if you discovered:
   - API endpoints or integration approaches
   - Challenges or gotchas
   - Important decisions made
   - Deviations from the original plan
3. Document any new dependencies added
4. Update cost estimates if applicable

### Step 7: Evaluate and Update PLAN.md
1. Review if the plan is still accurate based on learnings
2. Update the plan if:
   - You discovered a better approach (e.g., found an API instead of scraping)
   - The architecture needs adjustment
   - New risks or challenges emerged
   - Timeline/scope needs revision
3. Add or modify tasks in future phases based on new information
4. Keep the plan realistic and up-to-date

### Step 8: Repeat
1. Commit the changes (if git is being used)
2. Inform the user of completion and what was accomplished
3. Return to Step 1 for the next task

## Important Guidelines

### API-First Approach
- **Always check for APIs first** before implementing scraping
- Use browser DevTools → Network tab to discover API endpoints
- Document any APIs you find in the integration code
- Only install Playwright if absolutely necessary for scraping

### Database Strategy
- Start with local PostgreSQL during development
- Use Prisma for all database operations
- Keep migrations in `shared/prisma/migrations/`
- Don't set up Neon until Phase 6 (deployment)

### Code Organization
- Keep Next.js app (frontend) separate from integration service (backend)
- Share types and utilities via `shared/` folder
- Each studio integration should be a separate file
- Follow the `BaseIntegration` interface pattern

### Testing Philosophy
- Test business logic, not implementation details
- Mock external APIs in tests
- Use fixtures for test data
- Keep tests fast and independent

### When to Ask for Help
- If a task is unclear or seems incorrect
- If you need credentials/API keys for a service
- If you discover the plan needs significant changes
- If you're blocked on a decision that affects architecture

## Current Phase

Check `PLAN.md` for the current phase and tasks. Start with **Phase 1: Foundation** if just beginning.

## Reference Documentation

- Full project plan: `PLAN.md`
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- Playwright docs: https://playwright.dev/docs (only if needed)
