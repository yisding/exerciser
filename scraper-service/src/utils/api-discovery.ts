import { chromium, Page } from 'playwright';

// Simple logger for this utility
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[APIDiscovery] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[APIDiscovery] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[APIDiscovery] ${msg}`, ...args),
};

interface NetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  headers: Record<string, string>;
  postData?: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    body?: string;
  };
}

/**
 * API Discovery Tool
 *
 * Monitors network requests on a webpage to identify API endpoints
 * that can be used for data integration instead of scraping.
 */
export class APIDiscovery {
  private requests: NetworkRequest[] = [];

  /**
   * Discover APIs used by a webpage
   */
  async discover(url: string, options: {
    waitFor?: number;
    interactWithPage?: (page: Page) => Promise<void>;
    filterUrls?: string[];
  } = {}): Promise<NetworkRequest[]> {
    const { waitFor = 5000, interactWithPage, filterUrls } = options;

    logger.info(`Starting API discovery for: ${url}`);

    // Configure browser to use the system proxy
    const proxyServer = process.env.HTTP_PROXY || process.env.http_proxy;

    const browser = await chromium.launch({
      headless: true,
      proxy: proxyServer ? { server: proxyServer } : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      });

      const page = await context.newPage();

      // Listen to all network requests
      page.on('request', (request) => {
        const resourceType = request.resourceType();

        // Only track XHR/Fetch/API requests
        if (['xhr', 'fetch', 'websocket'].includes(resourceType)) {
          const reqUrl = request.url();

          // Apply filters if provided
          if (filterUrls && !filterUrls.some(filter => reqUrl.includes(filter))) {
            return;
          }

          this.requests.push({
            url: reqUrl,
            method: request.method(),
            resourceType,
            headers: request.headers(),
            postData: request.postData() || undefined,
          });

          logger.info(`API Request: ${request.method()} ${reqUrl}`);
        }
      });

      // Listen to responses
      page.on('response', async (response) => {
        const request = response.request();
        const resourceType = request.resourceType();

        if (['xhr', 'fetch', 'websocket'].includes(resourceType)) {
          const reqUrl = request.url();

          // Apply filters if provided
          if (filterUrls && !filterUrls.some(filter => reqUrl.includes(filter))) {
            return;
          }

          try {
            const contentType = response.headers()['content-type'] || '';
            let body: string | undefined;

            // Only try to get body for JSON responses
            if (contentType.includes('application/json')) {
              try {
                const json = await response.json();
                body = JSON.stringify(json, null, 2);
              } catch (e) {
                // Ignore JSON parse errors
              }
            }

            // Find the matching request and add response data
            const matchingReq = this.requests.find(r => r.url === reqUrl && !r.response);
            if (matchingReq) {
              matchingReq.response = {
                status: response.status(),
                headers: response.headers(),
                body,
              };
            }

            logger.info(`API Response: ${response.status()} ${reqUrl}`);
          } catch (error) {
            logger.error(`Error processing response for ${reqUrl}:`, error);
          }
        }
      });

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Optionally interact with the page (e.g., click buttons, fill forms)
      if (interactWithPage) {
        await interactWithPage(page);
      }

      // Wait for additional requests
      await page.waitForTimeout(waitFor);

      await context.close();

      logger.info(`Discovered ${this.requests.length} API requests`);
      return this.requests;

    } finally {
      await browser.close();
    }
  }

  /**
   * Pretty print discovered APIs
   */
  printDiscovery(): void {
    console.log('\n========== API DISCOVERY REPORT ==========\n');
    console.log(`Total API requests found: ${this.requests.length}\n`);

    this.requests.forEach((req, index) => {
      console.log(`\n[${index + 1}] ${req.method} ${req.url}`);
      console.log(`  Resource Type: ${req.resourceType}`);

      if (req.postData) {
        console.log(`  POST Data: ${req.postData.substring(0, 200)}${req.postData.length > 200 ? '...' : ''}`);
      }

      if (req.response) {
        console.log(`  Response Status: ${req.response.status}`);
        if (req.response.body) {
          console.log(`  Response Body (preview):`);
          console.log(`  ${req.response.body.substring(0, 500)}${req.response.body.length > 500 ? '...' : ''}`);
        }
      }
    });

    console.log('\n==========================================\n');
  }

  /**
   * Save discovery results to a file
   */
  async saveToFile(filename: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(
      filename,
      JSON.stringify(this.requests, null, 2),
      'utf-8'
    );
    logger.info(`Discovery results saved to: ${filename}`);
  }
}

/**
 * Example usage for Club Pilates
 */
async function discoverClubPilatesAPI() {
  const discovery = new APIDiscovery();

  // Try to discover APIs from Club Pilates main site first
  const requests = await discovery.discover('https://www.clubpilates.com', {
    waitFor: 10000,
    filterUrls: ['api', 'schedule', 'class', 'location', 'clubready'],
    interactWithPage: async (page) => {
      // Try to navigate to schedule or find a studio
      try {
        // Look for "Find a Studio" or similar links
        const findStudioLink = page.locator('a:has-text("Find")').first();
        if (await findStudioLink.isVisible({ timeout: 3000 })) {
          await findStudioLink.click();
          await page.waitForTimeout(3000);
        }
      } catch (error) {
        logger.warn('Could not interact with page:', error);
      }
    },
  });

  discovery.printDiscovery();
  await discovery.saveToFile('./club-pilates-api-discovery.json');

  return requests;
}

// Run if executed directly
if (require.main === module) {
  discoverClubPilatesAPI()
    .then(() => {
      logger.info('Discovery complete');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Discovery failed:', error);
      process.exit(1);
    });
}

export { discoverClubPilatesAPI };
