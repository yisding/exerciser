import { BaseIntegration } from '../base.integration';
import { FitnessClass, RawClassData } from '../../../../shared/types';
import { chromium, Browser, Page } from 'playwright';

/**
 * Base class for web-based integrations (scraping or reverse-engineered APIs)
 *
 * This class provides utilities for:
 * 1. Capturing API calls made by the website itself
 * 2. Web scraping when no API is available
 * 3. Handling authentication and cookies
 */
export abstract class WebIntegration extends BaseIntegration {
  abstract studioId: string;
  abstract studioName: string;
  abstract brand: string;

  protected browser?: Browser;
  protected capturedRequests: Array<{
    url: string;
    method: string;
    headers: Record<string, string>;
    postData?: string;
    response?: any;
  }> = [];

  integrationType = 'scraper' as const;

  /**
   * Get the URL to scrape/monitor for this integration
   */
  protected abstract getScheduleUrl(date: Date): string;

  /**
   * Launch browser and set up request interception
   */
  protected async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const proxyServer = process.env.HTTP_PROXY || process.env.http_proxy;

    this.browser = await chromium.launch({
      headless: true,
      proxy: proxyServer ? { server: proxyServer } : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    return this.browser;
  }

  /**
   * Create a new page with request/response monitoring
   */
  protected async createMonitoredPage(): Promise<Page> {
    const browser = await this.launchBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Monitor all requests
    page.on('request', (request) => {
      const url = request.url();
      // Only capture API-like requests
      if (this.shouldCaptureRequest(url)) {
        console.log(`[${this.studioId}] Capturing request: ${request.method()} ${url}`);
      }
    });

    // Monitor all responses
    page.on('response', async (response) => {
      const url = response.url();
      if (this.shouldCaptureRequest(url)) {
        try {
          const request = response.request();
          const responseBody = await response.json().catch(() => null);

          this.capturedRequests.push({
            url: url,
            method: request.method(),
            headers: request.headers(),
            postData: request.postData() || undefined,
            response: responseBody
          });

          console.log(`[${this.studioId}] Captured response from: ${url}`);
        } catch (error) {
          console.warn(`[${this.studioId}] Could not capture response:`, error);
        }
      }
    });

    return page;
  }

  /**
   * Determine if a request should be captured
   * Override this to customize what requests are captured
   */
  protected shouldCaptureRequest(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return (
      (lowerUrl.includes('/api') ||
       lowerUrl.includes('/schedule') ||
       lowerUrl.includes('/class') ||
       lowerUrl.includes('/booking') ||
       lowerUrl.includes('.json')) &&
      !lowerUrl.includes('google') &&
      !lowerUrl.includes('analytics') &&
      !lowerUrl.includes('facebook') &&
      !lowerUrl.includes('tracking')
    );
  }

  /**
   * Fetch classes by monitoring website API calls
   */
  async fetch(date: Date): Promise<RawClassData[]> {
    try {
      this.capturedRequests = []; // Reset
      const url = this.getScheduleUrl(date);

      console.log(`[${this.studioId}] Loading page: ${url}`);

      const page = await this.createMonitoredPage();

      // Navigate to the schedule page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait a bit for any delayed API calls
      await page.waitForTimeout(2000);

      // Try to interact with the page to trigger more API calls
      await this.interactWithPage(page, date);

      // Wait for any responses from interactions
      await page.waitForTimeout(2000);

      console.log(`[${this.studioId}] Captured ${this.capturedRequests.length} API requests`);

      // Try to parse API responses first
      const apiData = await this.parseApiResponses(this.capturedRequests);
      if (apiData.length > 0) {
        console.log(`[${this.studioId}] Found ${apiData.length} classes from API responses`);
        await page.close();
        return apiData;
      }

      // Fall back to HTML scraping
      console.log(`[${this.studioId}] No API data found, falling back to HTML scraping`);
      const scrapedData = await this.scrapePageData(page, date);
      await page.close();

      if (scrapedData.length > 0) {
        console.log(`[${this.studioId}] Scraped ${scrapedData.length} classes from HTML`);
        return scrapedData;
      }

      // Fall back to mock data
      console.warn(`[${this.studioId}] No data found, using mock data`);
      return this.getMockData(date);

    } catch (error) {
      console.error(`[${this.studioId}] Error fetching data:`, error);
      return this.getMockData(date);
    }
  }

  /**
   * Interact with the page to trigger API calls
   * Override this to customize interactions (click buttons, select dates, etc.)
   */
  protected async interactWithPage(page: Page, date: Date): Promise<void> {
    // Default: try to find and click on the date
    // Subclasses should override with specific interactions
    try {
      // Look for date pickers, calendar elements, etc.
      const dateButton = page.locator(`button:has-text("${date.getDate()}")`).first();
      if (await dateButton.isVisible({ timeout: 1000 })) {
        await dateButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      // Ignore interaction errors
    }
  }

  /**
   * Parse captured API responses into RawClassData
   * Subclasses should override this with brand-specific parsing
   */
  protected abstract parseApiResponses(requests: typeof this.capturedRequests): Promise<RawClassData[]>;

  /**
   * Scrape class data from HTML page
   * Subclasses should override this with brand-specific scraping
   */
  protected abstract scrapePageData(page: Page, date: Date): Promise<RawClassData[]>;

  /**
   * Generate mock data for development/testing
   */
  protected abstract getMockData(date: Date): RawClassData[];

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}
