# API Discovery Results

## Overview

This document summarizes the API platforms used by our fitness studio partners and the integration approach for each.

## Platform Summary

### ClubReady Platform
**Used by:** Club Pilates, CycleBar, Row House, Pure Barre, YogaSix (all Xponential brands)

**API Details:**
- Base URL: `https://www.clubready.com/api/current`
- Authentication: API Key required (request from support@clubready.com)
- Formats: JSON, XML, JSV, CSV
- Developer Portal: https://developer.clubready.com/

**Key Endpoints:**
- `GetClassScheduleRequest` - Get class schedules
- `GetClassScheduleRequestV2` - Enhanced schedule retrieval
- `CreateClassBookingRequest` - Book classes
- `ClassCategoriesRequest` - Get class categories
- `CheckBookingStatusRequest` - Check booking status

**Request Example:**
```http
GET /api/current/json/reply/GetClassScheduleRequest?ApiKey={key}&StoreId={id}&StartDate={date}&EndDate={date}
```

**Response Fields (typical):**
- ClassId
- ClassName
- InstructorName
- StartTime
- EndTime
- Duration
- Capacity
- SpotsAvailable
- Level
- StudioLocation

### MINDBODY Platform
**Used by:** Independent studios, potentially Title Boxing, barre3, StretchLab

**API Details:**
- Base URL: `https://api.mindbodyonline.com/public/v6`
- Authentication: API Key + optional staff credentials
- Format: JSON
- Developer Portal: https://developers.mindbodyonline.com/
- TypeScript Library: `mindbody-api-v6` npm package

**Key Endpoints:**
- `GET /class/classes` - Get class schedules
- `GET /site/locations` - Get studio locations
- `GET /staff/staff` - Get staff/instructor info

**Request Example:**
```typescript
import { Class, Config } from 'mindbody-api-v6';

Config.setup({
  apiKey: 'your-api-key',
});

const classes = await Class.getClassSchedules({
  siteID: '123',
  params: {
    StartDate: '2024-01-01',
    LocationIds: [1, 2],
  },
});
```

### Custom Platforms
**Studios requiring individual discovery:**
- F45 Training (f45training.com) - Custom platform
- Spenga (spenga.com) - Unknown platform
- Rumble Boxing (rumbleboxinggym.com) - Custom booking
- Jia Ren Yoga (vagaro.com) - Uses Vagaro platform
- [solidcore] (solidcore.co) - Custom platform

**Discovery Method:**
1. Visit studio website
2. Monitor network requests (use API Discovery Tool)
3. Identify API endpoints
4. Document request/response formats
5. Implement integration adapter

## API Credentials Required

### ClubReady
- [ ] API Key (request from support@clubready.com)
- [ ] Store IDs for each location

### MINDBODY
- [ ] API Key (apply at developers.mindbodyonline.com)
- [ ] Site IDs for each studio location
- [ ] Optional: Staff credentials for enhanced access

### Vagaro (Jia Ren Yoga)
- [ ] API credentials (if available)
- [ ] Or use web scraping approach

## Next Steps

1. **Obtain API Credentials:**
   - Apply for ClubReady API access for Xponential brands
   - Apply for MINDBODY API access for independent studios
   - Document store/site IDs for each location

2. **Discover Custom APIs:**
   - Run API Discovery Tool on F45, Spenga, Rumble, [solidcore]
   - Document findings
   - Create integration adapters

3. **Implement Real Integrations:**
   - Replace mock data with real API calls
   - Add error handling and rate limiting
   - Implement caching strategy

4. **Test:**
   - Verify data accuracy
   - Test error scenarios
   - Validate data normalization

## Environment Configuration

Add to `.env`:
```env
# ClubReady
CLUBREADY_API_KEY=your_key_here
CLUBREADY_STORE_IDS={"club-pilates-sf-fidi": "12345", ...}

# MINDBODY
MINDBODY_API_KEY=your_key_here
MINDBODY_SITE_IDS={"title-boxing-sf": "67890", ...}
```

## Rate Limits

- **ClubReady:** Unknown (to be determined)
- **MINDBODY:** 1,000 calls/day (free tier), varies by plan
- **Custom APIs:** TBD per platform

## Documentation Updates

Last Updated: 2025-11-17
Status: API platforms identified, awaiting credentials for implementation
