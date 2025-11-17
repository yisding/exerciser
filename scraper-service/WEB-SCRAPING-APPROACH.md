# Web Scraping & API Reverse-Engineering Approach

## Overview

Since obtaining official API keys from ClubReady, MINDBODY, and other platforms can be difficult or expensive, we've built a robust web-based integration system that:

1. **Monitors real website API calls** - Captures the same APIs the website uses
2. **Reverse-engineers those APIs** - Uses discovered endpoints directly
3. **Falls back to HTML scraping** - When APIs aren't accessible
4. **Uses mock data as fallback** - Ensures the app always works

## How It Works

### Architecture

```
WebIntegration (base class)
    ↓
ClubPilatesWebIntegration
CycleBarWebIntegration
...etc
```

### Integration Flow

```
1. Launch headless browser
2. Navigate to studio's schedule page
3. Monitor all network requests
4. Capture API calls (MINDBODY, ClubReady, etc.)
5. Parse API responses → Extract class data
6. If no API found → Scrape HTML
7. If scraping fails → Use mock data
```

### Code Example

```typescript
// The integration automatically:
const integration = new ClubPilatesWebIntegration();
const classes = await integration.fetch(new Date());

// Behind the scenes it:
// 1. Loads https://www.clubpilates.com/location/sf/schedule
// 2. Captures: GET https://api.mindbodyonline.com/public/v6/class/classes
// 3. Parses the JSON response
// 4. Returns normalized class data
```

## Current Status

### ✅ Implemented
- **Base Framework**: `WebIntegration` class with full functionality
- **Club Pilates**: `ClubPilatesWebIntegration` - monitors/scrapes real website
- **API Discovery Tool**: `src/utils/api-discovery.ts`
- **Testing**: `src/test-web-integration.ts`
- **Documentation**: `DISCOVER-APIS.md` - comprehensive guide

### 🚧 TODO
- CycleBar web integration
- Row House web integration
- Pure Barre web integration
- YogaSix web integration
- F45 web integration
- barre3 web integration
- Title Boxing web integration
- StretchLab web integration
- Spenga web integration
- Rumble Boxing web integration
- Jia Ren Yoga web integration
- [solidcore] web integration

## Benefits of This Approach

### ✅ Advantages
1. **No API keys required** - Works immediately
2. **Real data** - Gets actual schedules from websites
3. **Resilient** - Multiple fallback strategies
4. **Discoverable** - Easy to find new APIs
5. **Maintainable** - When a site changes, update one integration

### ⚠️ Considerations
1. **Rate limiting** - Be respectful of websites (we add delays)
2. **Changes** - Website updates may break scraping (APIs are more stable)
3. **Performance** - Browser automation is slower than direct API calls
4. **Terms of Service** - Review each site's ToS

## Using the Framework

### Test an Integration

```bash
# Test Club Pilates
npx ts-node src/test-web-integration.ts

# See what APIs were discovered
# Check the console output for captured requests
```

### Discover APIs Manually

See `DISCOVER-APIS.md` for step-by-step instructions on finding APIs with Browser DevTools.

### Create a New Integration

```typescript
import { WebIntegration } from './base/web-integration';

export class YourStudioIntegration extends WebIntegration {
  studioId = 'your-studio';
  studioName = 'Your Studio';
  brand = 'Your Studio';

  protected getScheduleUrl(date: Date): string {
    return 'https://yourstudio.com/schedule';
  }

  protected async parseApiResponses(requests): Promise<RawClassData[]> {
    // Parse captured API responses
    // Look for requests.url.includes('your-api-endpoint')
    // Extract class data from responses
  }

  protected async scrapePageData(page, date): Promise<RawClassData[]> {
    // Scrape HTML as fallback
    // Use page.locator() to find class elements
    // Extract text and parse into class data
  }

  protected getMockData(date: Date): RawClassData[] {
    // Provide mock data as last resort
  }
}
```

### Add to Orchestrator

```typescript
// src/integrations/orchestrator.ts
import { YourStudioIntegration } from './your-studio-web.integration';

constructor() {
  this.integrations = [
    // ... existing integrations
    new YourStudioIntegration(),
  ];
}
```

## API Patterns We've Discovered

### MINDBODY (Used by Many Studios)

```javascript
// Request
GET https://api.mindbodyonline.com/public/v6/class/classes
Headers: {
  "Api-Key": "...",
  "SiteId": "..."
}

// Response
{
  "Classes": [
    {
      "Id": 12345,
      "ClassDescription": { "Name": "Pilates" },
      "Staff": { "Name": "Jane Doe" },
      "StartDateTime": "2025-01-20T10:00:00",
      "MaxCapacity": 12,
      "TotalBooked": 5
    }
  ]
}
```

### ClubReady (Xponential Brands)

```javascript
// Request
GET https://www.clubready.com/api/current/json/reply/GetClassScheduleRequestV2
Params: {
  "ApiKey": "...",
  "StoreId": "...",
  "StartDate": "2025-01-20T00:00:00"
}

// Response
{
  "Classes": [
    {
      "ClassId": 12345,
      "ClassName": "Reformer Flow",
      "InstructorName": "Sarah Johnson",
      "StartTime": "2025-01-20T10:00:00",
      "Capacity": 12,
      "SpotsAvailable": 7
    }
  ]
}
```

## Best Practices

### 1. Respect Websites
```typescript
// Add delays between requests
await page.waitForTimeout(1000);

// Use realistic user agents
userAgent: 'Mozilla/5.0 (Macintosh; ...'

// Cache data - don't fetch repeatedly
// Check robots.txt
```

### 2. Handle Errors Gracefully
```typescript
try {
  // Try web scraping
} catch (error) {
  // Fall back to mock data
  return this.getMockData(date);
}
```

### 3. Log Everything
```typescript
console.log(`[${this.studioId}] Capturing request: ${url}`);
console.log(`[${this.studioId}] Found ${classes.length} classes`);
```

### 4. Test Thoroughly
```bash
npm run test
npm run build
npm run start:dev
```

## Troubleshooting

### "No API calls captured"
- Website might load data via static HTML
- Check if JavaScript is required (wait longer)
- Try interacting with page elements
- Fall back to HTML scraping

### "Scraping returns empty"
- Class selectors might be wrong
- Page might need authentication
- Try different selectors in `scrapePageData()`

### "Browser won't launch"
- Install Playwright browsers: `npx playwright install`
- Check if headless mode works: `HEADLESS=false npm test`
- Verify proxy settings if behind corporate firewall

### "Network errors"
- Check internet connection
- Verify website is accessible
- Look for rate limiting (429 status)
- Add delays between requests

## Next Steps

1. **Discover More APIs**: Use `DISCOVER-APIS.md` guide
2. **Implement Integrations**: One studio at a time
3. **Test Thoroughly**: Verify real data is correct
4. **Optimize**: Cache responses, reduce browser overhead
5. **Deploy**: Consider headless Chrome in production

## Resources

- `DISCOVER-APIS.md` - How to find APIs manually
- `API-INTEGRATION-GUIDE.md` - Official API approach (if keys available)
- `src/integrations/base/web-integration.ts` - Base class implementation
- `src/integrations/club-pilates-web.integration.ts` - Working example
- `src/test-web-integration.ts` - Test script

## Contributing

To add a new studio integration:

1. Discover the API (see `DISCOVER-APIS.md`)
2. Create `[studio]-web.integration.ts`
3. Implement `parseApiResponses()` and `scrapePageData()`
4. Test with `npm test`
5. Add to orchestrator
6. Submit PR

Happy scraping! 🕷️
