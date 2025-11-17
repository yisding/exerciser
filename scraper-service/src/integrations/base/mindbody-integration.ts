import { BaseIntegration } from '../base.integration';
import { FitnessClass, RawClassData } from '../../../../shared/types';

/**
 * Base class for MINDBODY integrations
 * Used by studios on the MINDBODY platform
 */
export abstract class MindbodyIntegration extends BaseIntegration {
  abstract studioId: string;
  abstract studioName: string;
  abstract brand: string;
  protected abstract mindbodySiteId: string;

  integrationType = 'api' as const;

  /**
   * Fetch classes from MINDBODY Public API V6
   */
  async fetch(date: Date): Promise<RawClassData[]> {
    const apiKey = process.env.MINDBODY_API_KEY;

    if (!apiKey) {
      console.warn(`MINDBODY API key not configured for ${this.studioName}. Using mock data.`);
      return this.getMockData(date);
    }

    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // MINDBODY Public API V6 endpoint
      const url = 'https://api.mindbodyonline.com/public/v6/class/classes';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'SiteId': this.mindbodySiteId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          StartDateTime: startDate.toISOString(),
          EndDateTime: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`MINDBODY API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMindbodyResponse(data);
    } catch (error) {
      console.error(`Error fetching from MINDBODY for ${this.studioName}:`, error);
      // Fallback to mock data
      return this.getMockData(date);
    }
  }

  /**
   * Parse MINDBODY API response into RawClassData format
   */
  protected parseMindbodyResponse(data: any): RawClassData[] {
    if (!data.Classes || !Array.isArray(data.Classes)) {
      return [];
    }

    return data.Classes.map((classItem: any) => ({
      id: `${this.studioId}-${classItem.Id}`,
      name: classItem.ClassDescription?.Name || classItem.Name,
      instructor: classItem.Staff?.DisplayName || 'TBD',
      startTime: new Date(classItem.StartDateTime),
      endTime: new Date(classItem.EndDateTime),
      duration: classItem.Duration || this.calculateDuration(classItem.StartDateTime, classItem.EndDateTime),
      capacity: classItem.MaxCapacity,
      spotsAvailable: classItem.TotalBooked ? classItem.MaxCapacity - classItem.TotalBooked : undefined,
      level: classItem.ClassDescription?.Level || classItem.Level,
      location: classItem.Location?.Name || this.studioName,
      bookingUrl: classItem.BookingUrl || `https://clients.mindbodyonline.com/classic/ws?studioid=${this.mindbodySiteId}`,
    }));
  }

  /**
   * Calculate duration in minutes from start and end times
   */
  protected calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Normalize MINDBODY data to standard format
   */
  normalize(rawData: RawClassData[]): FitnessClass[] {
    return rawData.map((classData) => ({
      id: classData.id,
      studioId: this.studioId,
      className: classData.name,
      instructor: classData.instructor,
      startTime: classData.startTime,
      endTime: classData.endTime,
      duration: classData.duration,
      capacity: classData.capacity,
      spotsAvailable: classData.spotsAvailable,
      level: classData.level,
      bookingUrl: classData.bookingUrl,
    }));
  }

  /**
   * Generate mock data for testing/development
   * Subclasses should override this with realistic mock data
   */
  protected abstract getMockData(date: Date): RawClassData[];
}
