# How to Discover Real APIs from Fitness Studio Websites

This guide shows you how to discover the real APIs used by fitness studio websites on your local machine.

## Quick Start

The easiest way to discover APIs is to run our test script with a visible browser:

```bash
cd scraper-service
HEADLESS=false npx ts-node src/test-web-integration.ts
```

This will:
1. Open a real Chrome browser
2. Navigate to the studio's schedule page
3. Capture all API requests made by the page
4. Print the discovered endpoints and data

## Method 1: Use Our Integration Framework (Recommended)

Our web integrations automatically capture and log API calls:

```bash
# Test Club Pilates
npx ts-node src/test-web-integration.ts

# The output will show captured API requests like:
# [club-pilates] Capturing request: GET https://api.example.com/classes
# [club-pilates] Captured response from: https://api.example.com/classes
```

Look for URLs containing:
- `/api/`
- `/schedule`
- `/classes`
- `/booking`
- `mindbody`
- `clubready`

## Method 2: Manual Discovery with Browser DevTools

### Step 1: Open the Studio Website

Open the booking/schedule page for any studio:
- Club Pilates: https://www.clubpilates.com/location/[your-city]
- CycleBar: https://www.cyclebar.com/location/[your-city]
- Row House: https://therowhouse.com/location/[your-city]
- etc.

### Step 2: Open Developer Tools

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### Step 3: Go to Network Tab

1. Click on the **Network** tab in DevTools
2. Check **"Preserve log"** checkbox (important!)
3. Filter by **"Fetch/XHR"** to see only API calls

### Step 4: Navigate the Schedule

1. Select a date on the calendar
2. Click "View Schedule" or similar buttons
3. Watch the Network tab for new requests

### Step 5: Identify API Calls

Look for requests to URLs like:
```
https://api.mindbodyonline.com/public/v6/class/classes
https://www.clubready.com/api/current/json/reply/GetClassSchedule
https://widgets.mindbodyonline.com/schedules/...
```

### Step 6: Examine the Request

Click on an API request to see:

**Request Details:**
- URL and parameters
- HTTP method (GET/POST)
- Headers (especially authorization)
- Request payload (for POST requests)

**Response:**
- JSON data with class information
- Structure: class name, instructor, time, spots available, etc.

### Step 7: Document the API

Take notes on:
```javascript
{
  "url": "https://api.example.com/classes",
  "method": "GET",
  "params": {
    "date": "2025-01-20",
    "locationId": "12345"
  },
  "headers": {
    "Authorization": "Bearer ...",
    "Api-Key": "..."
  },
  "responseFormat": {
    "classes": [
      {
        "id": "...",
        "name": "...",
        "instructor": "...",
        "startTime": "...",
        // etc.
      }
    ]
  }
}
```

## Method 3: Copy as cURL and Test

### In DevTools:
1. Right-click on the API request
2. Select **"Copy" → "Copy as cURL"**
3. Paste into a terminal to test:

```bash
curl 'https://api.example.com/classes?date=2025-01-20' \
  -H 'Api-Key: your-key-here' \
  -H 'User-Agent: Mozilla/5.0...'
```

### Convert cURL to fetch():

Use a tool like https://curl.trillworks.com/ to convert cURL commands to JavaScript fetch() calls.

## Common API Patterns

### MINDBODY (Most Common)

Many studios use MINDBODY's booking platform:

```javascript
// Endpoint
GET https://api.mindbodyonline.com/public/v6/class/classes

// Headers
{
  "Api-Key": "your_key",
  "SiteId": "site_id",
  "Content-Type": "application/json"
}

// Response
{
  "Classes": [
    {
      "Id": 12345,
      "ClassDescription": {
        "Name": "Pilates Reformer"
      },
      "Staff": {
        "Name": "Jane Doe"
      },
      "StartDateTime": "2025-01-20T10:00:00",
      "EndDateTime": "2025-01-20T11:00:00",
      "MaxCapacity": 12,
      "TotalBooked": 5
    }
  ]
}
```

### ClubReady (Xponential Brands)

Club Pilates, CycleBar, Row House, Pure Barre, YogaSix:

```javascript
// Endpoint
GET https://www.clubready.com/api/current/json/reply/GetClassScheduleRequestV2

// Query Params
{
  "ApiKey": "...",
  "StoreId": "...",
  "StartDate": "2025-01-20T00:00:00",
  "EndDate": "2025-01-20T23:59:59"
}

// Response
{
  "Classes": [
    {
      "ClassId": 12345,
      "ClassName": "Reformer Flow",
      "InstructorName": "Sarah Johnson",
      "StartTime": "2025-01-20T10:00:00",
      "EndTime": "2025-01-20T10:50:00",
      "Capacity": 12,
      "SpotsAvailable": 7
    }
  ]
}
```

### Custom APIs

Some studios have proprietary booking systems. Look for:
- Consistent URL patterns (`/api/`, `/schedule/`)
- JSON responses with class data
- GraphQL endpoints (`/graphql`)

## Implementing Discovered APIs

Once you've discovered an API, update the integration:

### 1. Update the `parseApiResponses()` method:

```typescript
protected async parseApiResponses(requests: any[]): Promise<RawClassData[]> {
  const classes: RawClassData[] = [];

  for (const req of requests) {
    // Check if this is the API we discovered
    if (req.url.includes('your-discovered-api-endpoint')) {
      for (const item of req.response.classes) {
        classes.push({
          id: item.id,
          name: item.className,
          instructor: item.instructor,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          // ... map other fields
        });
      }
    }
  }

  return classes;
}
```

### 2. Or make direct API calls in `fetch()`:

```typescript
async fetch(date: Date): Promise<RawClassData[]> {
  try {
    // Use the discovered API directly
    const response = await fetch('https://discovered-api.com/classes', {
      headers: {
        'Api-Key': 'discovered-key',
        // ... other headers
      }
    });

    const data = await response.json();
    return this.parseResponse(data);

  } catch (error) {
    // Fall back to web scraping or mock data
    return super.fetch(date);
  }
}
```

## Tips & Tricks

### Finding Hidden APIs

1. **Look at JavaScript files**: Check loaded JS files for API URLs
2. **Search for "api" in the source**: View page source and Ctrl+F for "api"
3. **Check localStorage**: Console → `localStorage` may have tokens/keys
4. **Follow redirects**: Some booking widgets redirect to external APIs

### Avoiding Rate Limits

1. **Cache responses**: Don't fetch the same data repeatedly
2. **Respect robots.txt**: Check `https://example.com/robots.txt`
3. **Add delays**: Wait 1-2 seconds between requests
4. **Use realistic User-Agent**: Match a real browser

### Authentication

If an API requires authentication:

1. **API Key in header**: Most common, look in Network → Headers
2. **Bearer token**: Check Authorization header
3. **Cookies**: May need to maintain a session
4. **OAuth**: More complex, may need user login flow

## Testing Your Discovery

Once you've documented an API, test it:

```bash
# Test in isolation
curl 'https://api.example.com/schedule' -H 'Api-Key: your-key'

# Test in our integration
npx ts-node src/test-web-integration.ts

# Run the full integration pipeline
npm run start:dev
```

## Legal & Ethical Considerations

✅ **Generally OK:**
- Using publicly accessible APIs for personal use
- Respecting rate limits and robots.txt
- Caching data to reduce requests
- Attributing data sources

❌ **Avoid:**
- Bypassing authentication/paywalls
- Ignoring rate limits (DDoS)
- Scraping private/user-specific data
- Commercial use without permission
- Circumventing bot detection aggressively

## Need Help?

If you discover an API and need help implementing it:

1. Create an issue with the API details
2. Include example requests/responses (remove any keys!)
3. Tag it with "api-discovery"

## Next Steps

After discovering APIs:
1. Document them in `API-DISCOVERY.md`
2. Implement in the appropriate integration file
3. Test with `npm test`
4. Submit a PR!

Happy API hunting! 🔍
