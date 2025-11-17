# API Integration Guide

This guide explains how to set up real API integrations for the fitness studio data sources.

## Overview

Our fitness studios use three main platform types:

1. **ClubReady** - Used by Xponential Fitness brands (Club Pilates, CycleBar, Row House, Pure Barre, YogaSix)
2. **MINDBODY** - Used by independent studios (Title Boxing, barre3, StretchLab, etc.)
3. **Custom Platforms** - Used by F45, Spenga, Rumble, [solidcore], Jia Ren Yoga

## Getting Started

### Step 1: Obtain API Credentials

#### ClubReady API

**For:** Club Pilates, CycleBar, Row House, Pure Barre, YogaSix

1. Email support@clubready.com with subject "API Access Request"
2. Provide your business details and use case
3. Sign the API agreement
4. Receive your API key and store IDs

**Documentation:** https://developer.clubready.com/

**Endpoints:**
- Base URL: `https://www.clubready.com/api/current`
- Schedule: `/json/reply/GetClassScheduleRequestV2`
- Format: JSON, XML, JSV, CSV

#### MINDBODY Public API

**For:** Title Boxing, barre3, StretchLab, and independent studios

1. Visit https://developers.mindbodyonline.com/
2. Sign up for a developer account
3. Create an app to get your API key
4. Obtain site IDs for each studio location

**Documentation:** https://developers.mindbodyonline.com/PublicDocumentation/V6

**TypeScript Library:** `mindbody-api-v6` npm package

**Endpoints:**
- Base URL: `https://api.mindbodyonline.com/public/v6`
- Classes: `GET /class/classes`
- Locations: `GET /site/locations`

**Rate Limit:** 1,000 calls/day (free tier)

#### Custom Platforms

**F45 Training** (f45training.com)
- No public API documented
- May require web scraping or partnership agreement

**Spenga** (spenga.com)
- Platform unknown
- Requires API discovery

**Rumble Boxing** (rumbleboxinggym.com)
- Custom booking system
- May have API available on request

**[solidcore]** (solidcore.co)
- Custom platform
- Requires investigation

**Jia Ren Yoga** (vagaro.com)
- Uses Vagaro platform
- Contact Vagaro for API access: https://www.vagaro.com/

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your API credentials:

```env
# ClubReady
CLUBREADY_API_KEY=your_actual_api_key
CLUBREADY_STORE_ID_CLUB_PILATES=12345

# MINDBODY
MINDBODY_API_KEY=your_actual_api_key
MINDBODY_SITE_ID_TITLE_BOXING=67890
```

### Step 3: Test the Integration

Run the integration test script:

```bash
npm run test:integrations
```

Or test a specific brand:

```bash
npm run test:integration -- club-pilates
```

### Step 4: Verify Data Quality

Check that the returned data includes:
- Class names
- Instructor names
- Start/end times
- Available spots
- Booking URLs

## API Integration Architecture

### Base Classes

We provide two abstract base classes:

#### `ClubReadyIntegration`

Located in `src/integrations/base/clubready-integration.ts`

**Features:**
- Handles ClubReady API authentication
- Parses ClubReady API responses
- Provides mock data fallback
- Normalizes data to our standard format

**Usage:**
```typescript
export class CycleBarIntegration extends ClubReadyIntegration {
  studioId = 'cyclebar';
  studioName = 'CycleBar';
  brand = 'CycleBar';
  protected clubReadyStoreId = process.env.CLUBREADY_STORE_ID_CYCLEBAR || 'PLACEHOLDER';

  protected getMockData(date: Date): RawClassData[] {
    // Return mock data for development
  }
}
```

#### `MindbodyIntegration`

Located in `src/integrations/base/mindbody-integration.ts`

**Features:**
- Handles MINDBODY API v6 authentication
- Parses MINDBODY API responses
- Provides mock data fallback
- Normalizes data to our standard format

**Usage:**
```typescript
export class TitleBoxingIntegration extends MindbodyIntegration {
  studioId = 'title-boxing';
  studioName = 'Title Boxing';
  brand = 'Title Boxing Club';
  protected mindbodySiteId = process.env.MINDBODY_SITE_ID_TITLE_BOXING || 'PLACEHOLDER';

  protected getMockData(date: Date): RawClassData[] {
    // Return mock data for development
  }
}
```

### Data Flow

1. **Fetch** - Integration calls real API or returns mock data
2. **Parse** - API response is parsed into `RawClassData[]`
3. **Normalize** - Data is transformed into `FitnessClass[]` format
4. **Store** - Classes are saved to database with studio associations

### Mock Data Fallback

Each integration provides mock data that is used when:
- API credentials are not configured
- API request fails
- During development/testing

This allows the app to work immediately without requiring API access.

## Discovering New APIs

For studios without documented APIs, use our API Discovery Tool:

### Using the API Discovery Tool

```bash
cd scraper-service
npx ts-node src/utils/api-discovery.ts
```

This will:
1. Launch a headless browser
2. Navigate to the studio website
3. Monitor all API requests
4. Save discovered endpoints to JSON

### Manual Discovery with Browser DevTools

1. Open the studio's booking website
2. Open Chrome DevTools (F12)
3. Go to Network tab
4. Filter by "Fetch/XHR"
5. Navigate to the schedule page
6. Look for API calls containing class data
7. Document the endpoint, method, and parameters

## Troubleshooting

### API Key Not Working

- Check that the key is correctly set in `.env`
- Verify the key hasn't expired
- Ensure you're using the correct base URL

### No Classes Returned

- Verify the date range is correct
- Check the store/site ID is valid
- Ensure the location has classes scheduled
- Review API response for error messages

### Rate Limiting

- MINDBODY free tier: 1,000 calls/day
- ClubReady: Varies by agreement
- Implement caching to reduce API calls
- Use database to store fetched classes

### CORS Errors

- API calls should be made server-side, not from the browser
- Use our integration service, not direct API calls from Next.js

## Next Steps

1. **Obtain Credentials** - Start with ClubReady and MINDBODY
2. **Test One Brand** - Verify Club Pilates integration works
3. **Expand Coverage** - Add remaining brands one by one
4. **Implement Caching** - Reduce API calls with Redis/database
5. **Monitor Usage** - Track API quota to avoid rate limits
6. **Error Handling** - Add retry logic and error notifications

## Support

- ClubReady Support: support@clubready.com
- MINDBODY Support: https://developers.mindbodyonline.com/
- Project Issues: Create an issue in the GitHub repository

## Resources

- [ClubReady Developer Portal](https://developer.clubready.com/)
- [MINDBODY Developer Portal](https://developers.mindbodyonline.com/)
- [MINDBODY TypeScript Library](https://github.com/SplitPass/mindbody-api)
- [API Discovery Tool Documentation](./src/utils/api-discovery.ts)
