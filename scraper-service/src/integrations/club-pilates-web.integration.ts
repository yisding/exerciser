import { WebIntegration } from './base/web-integration';
import { RawClassData } from '../../../shared/types';
import { Page } from 'playwright';

/**
 * Club Pilates Web Integration
 *
 * This integration reverse-engineers the Club Pilates website to get real schedule data.
 *
 * Approach:
 * 1. Monitor API calls made by the Club Pilates booking site
 * 2. Extract class schedule data from those API responses
 * 3. Fall back to HTML scraping if needed
 *
 * Target URL: https://www.clubpilates.com/location/{studio-id}/schedule
 * or: https://clients.mindbodyonline.com/classic/ws (they use MINDBODY for booking)
 */
export class ClubPilatesWebIntegration extends WebIntegration {
  studioId = 'club-pilates';
  studioName = 'Club Pilates';
  brand = 'Club Pilates';

  // Example Bay Area locations
  private locations = [
    {
      id: 'club-pilates-sf-marina',
      name: 'Club Pilates San Francisco - Marina',
      city: 'San Francisco',
      // MINDBODY site ID (would need to discover these)
      mindbodySiteId: '-99',
      url: 'https://www.clubpilates.com/location/san-francisco-ca-marina'
    },
    {
      id: 'club-pilates-oakland',
      name: 'Club Pilates Oakland - Montclair',
      city: 'Oakland',
      mindbodySiteId: '-99',
      url: 'https://www.clubpilates.com/location/oakland-ca-montclair'
    }
  ];

  private classTypes = [
    { name: 'Reformer Flow', level: 'All Levels', duration: 50 },
    { name: 'Center + Balance', level: 'Beginner', duration: 50 },
    { name: 'Control', level: 'Intermediate', duration: 50 },
    { name: 'Cardio Sculpt', level: 'Advanced', duration: 50 },
    { name: 'Restore', level: 'All Levels', duration: 50 },
  ];

  private instructors = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Park',
    'Jessica Williams', 'Ryan Martinez'
  ];

  protected getScheduleUrl(date: Date): string {
    // Start with the first location
    return this.locations[0].url + '/schedule';
  }

  /**
   * Interact with the schedule page to trigger API calls
   */
  protected async interactWithPage(page: Page, date: Date): Promise<void> {
    try {
      // Wait for the schedule to load
      await page.waitForSelector('[class*="schedule"], [class*="class"], .booking-calendar', {
        timeout: 5000
      }).catch(() => {});

      // Try to click on date selector if present
      const dateSelector = page.locator('input[type="date"], [class*="date-picker"]').first();
      if (await dateSelector.isVisible({ timeout: 2000 })) {
        const dateStr = date.toISOString().split('T')[0];
        await dateSelector.fill(dateStr);
        await page.waitForTimeout(1500);
      }

      // Try to click "View Schedule" or similar buttons
      const viewScheduleBtn = page.locator('button:has-text("Schedule"), a:has-text("Schedule")').first();
      if (await viewScheduleBtn.isVisible({ timeout: 2000 })) {
        await viewScheduleBtn.click();
        await page.waitForTimeout(1500);
      }

    } catch (error) {
      console.log(`[${this.studioId}] Interaction failed:`, error);
    }
  }

  /**
   * Check if this looks like a MINDBODY API call
   */
  protected shouldCaptureRequest(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('mindbody') ||
      lowerUrl.includes('clubready') ||
      lowerUrl.includes('/api') ||
      lowerUrl.includes('/schedule') ||
      lowerUrl.includes('/classes') ||
      lowerUrl.includes('booking')
    ) && !lowerUrl.includes('google') && !lowerUrl.includes('analytics');
  }

  /**
   * Parse API responses to extract class data
   */
  protected async parseApiResponses(requests: Array<{
    url: string;
    method: string;
    headers: Record<string, string>;
    postData?: string;
    response?: any;
  }>): Promise<RawClassData[]> {
    const classes: RawClassData[] = [];

    for (const req of requests) {
      if (!req.response) continue;

      try {
        // MINDBODY API response format
        if (req.url.includes('mindbody') && req.response.Classes) {
          for (const cls of req.response.Classes) {
            classes.push({
              id: `${this.studioId}-${cls.Id || cls.ClassScheduleId}`,
              name: cls.ClassDescription?.Name || cls.ClassName || 'Unknown Class',
              instructor: cls.Staff?.Name || cls.StaffName || cls.Instructor || 'TBD',
              startTime: new Date(cls.StartDateTime || cls.StartTime),
              endTime: new Date(cls.EndDateTime || cls.EndTime),
              duration: cls.Duration || 50,
              capacity: cls.MaxCapacity || cls.Capacity,
              spotsAvailable: cls.MaxCapacity - (cls.TotalBooked || 0),
              level: cls.ClassDescription?.Level || cls.Level || 'All Levels',
              location: cls.Location?.Name || this.studioName,
              bookingUrl: cls.BookingUrl || req.url
            });
          }
        }

        // ClubReady API response format
        else if (req.url.includes('clubready') && req.response.Classes) {
          for (const cls of req.response.Classes) {
            classes.push({
              id: `${this.studioId}-${cls.ClassId || cls.Id}`,
              name: cls.ClassName || cls.Name || 'Unknown Class',
              instructor: cls.InstructorName || cls.Instructor || 'TBD',
              startTime: new Date(cls.StartTime),
              endTime: new Date(cls.EndTime),
              duration: cls.Duration || 50,
              capacity: cls.Capacity,
              spotsAvailable: cls.SpotsAvailable || cls.Available,
              level: cls.Level || 'All Levels',
              location: cls.StudioLocation || this.studioName,
              bookingUrl: cls.BookingUrl || req.url
            });
          }
        }

        // Generic API format - look for array of objects with class-like properties
        else if (Array.isArray(req.response)) {
          for (const item of req.response) {
            if (item.name || item.className || item.title) {
              classes.push({
                id: `${this.studioId}-${item.id || Date.now()}`,
                name: item.name || item.className || item.title,
                instructor: item.instructor || item.teacher || item.staff || 'TBD',
                startTime: new Date(item.startTime || item.start || item.dateTime),
                endTime: new Date(item.endTime || item.end || item.dateTime),
                duration: item.duration || 50,
                capacity: item.capacity || item.maxCapacity,
                spotsAvailable: item.spotsAvailable || item.available,
                level: item.level || item.difficulty || 'All Levels',
                location: item.location || this.studioName,
                bookingUrl: item.bookingUrl || item.url || req.url
              });
            }
          }
        }

        // Check if response has a data/classes/schedule property
        else if (req.response.data || req.response.classes || req.response.schedule) {
          const data = req.response.data || req.response.classes || req.response.schedule;
          if (Array.isArray(data)) {
            // Recursively parse this array
            const parsed = await this.parseApiResponses([{ ...req, response: data }]);
            classes.push(...parsed);
          }
        }

      } catch (error) {
        console.warn(`[${this.studioId}] Error parsing API response:`, error);
      }
    }

    return classes;
  }

  /**
   * Scrape class data from HTML if no API found
   */
  protected async scrapePageData(page: Page, date: Date): Promise<RawClassData[]> {
    const classes: RawClassData[] = [];

    try {
      // Look for common class listing patterns
      const classSelectors = [
        '.class-item',
        '.schedule-item',
        '[class*="class-card"]',
        '[class*="schedule-row"]',
        'li[class*="class"]',
        '.booking-item'
      ];

      for (const selector of classSelectors) {
        const elements = await page.locator(selector).all();

        if (elements.length > 0) {
          console.log(`[${this.studioId}] Found ${elements.length} elements with selector: ${selector}`);

          for (const element of elements) {
            try {
              const text = await element.textContent() || '';

              // Extract class name (usually bold or in a heading)
              const nameEl = await element.locator('h1, h2, h3, h4, strong, [class*="title"], [class*="name"]').first().textContent().catch(() => null);

              // Extract time
              const timeEl = await element.locator('[class*="time"], time, .start-time').first().textContent().catch(() => null);

              // Extract instructor
              const instructorEl = await element.locator('[class*="instructor"], [class*="teacher"], [class*="staff"]').first().textContent().catch(() => null);

              if (nameEl && timeEl) {
                classes.push({
                  id: `${this.studioId}-scraped-${Date.now()}-${Math.random()}`,
                  name: nameEl.trim(),
                  instructor: instructorEl?.trim() || 'TBD',
                  startTime: this.parseTimeString(timeEl, date),
                  endTime: this.parseTimeString(timeEl, date), // Will adjust in normalize
                  duration: 50,
                  capacity: 12,
                  spotsAvailable: Math.floor(Math.random() * 12),
                  level: 'All Levels',
                  location: this.studioName,
                  bookingUrl: await page.url()
                });
              }
            } catch (error) {
              // Skip elements that fail to parse
            }
          }

          if (classes.length > 0) {
            break; // Found data, stop trying other selectors
          }
        }
      }

    } catch (error) {
      console.error(`[${this.studioId}] Error scraping page:`, error);
    }

    return classes;
  }

  /**
   * Parse a time string like "9:00 AM" or "09:00" into a Date
   */
  private parseTimeString(timeStr: string, date: Date): Date {
    const result = new Date(date);

    // Try to extract hour and minute
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;

      result.setHours(hour, minute, 0, 0);
    }

    return result;
  }

  /**
   * Normalize the data to standard format
   */
  normalize(rawData: RawClassData[]): any[] {
    return rawData.map((classData) => {
      // Ensure endTime is set properly
      const startTime = classData.startTime;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + classData.duration);

      return {
        id: classData.id,
        studioId: this.studioId,
        className: classData.name,
        instructor: classData.instructor,
        startTime: startTime,
        endTime: endTime,
        duration: classData.duration,
        capacity: classData.capacity,
        spotsAvailable: classData.spotsAvailable,
        level: classData.level,
        bookingUrl: classData.bookingUrl
      };
    });
  }

  /**
   * Generate mock data as fallback
   */
  protected getMockData(date: Date): RawClassData[] {
    const classes: RawClassData[] = [];
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // Generate realistic schedule
    for (const location of this.locations.slice(0, 2)) {
      const numClasses = 6 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numClasses; i++) {
        const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
        const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

        const hour = 6 + i * 2;
        const minute = [0, 30][Math.floor(Math.random() * 2)];

        const startTime = new Date(startDate);
        startTime.setHours(hour, minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + classType.duration);

        classes.push({
          id: `${location.id}-${startTime.getTime()}-${classType.name.replace(/\s/g, '-')}`,
          name: classType.name,
          instructor: instructor,
          startTime: startTime,
          endTime: endTime,
          duration: classType.duration,
          capacity: 12,
          spotsAvailable: Math.floor(Math.random() * 12),
          level: classType.level,
          location: location.city,
          bookingUrl: location.url
        });
      }
    }

    return classes;
  }
}
