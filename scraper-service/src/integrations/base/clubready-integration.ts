import { BaseIntegration } from '../base.integration';
import { FitnessClass, RawClassData } from '../../../../shared/types';

/**
 * Base class for ClubReady integrations
 * Used by Xponential Fitness brands: Club Pilates, CycleBar, Row House, Pure Barre, YogaSix
 */
export abstract class ClubReadyIntegration extends BaseIntegration {
  abstract studioId: string;
  abstract studioName: string;
  abstract brand: string;
  protected abstract clubReadyStoreId: string;

  integrationType = 'api' as const;

  /**
   * Fetch classes from ClubReady API
   */
  async fetch(date: Date): Promise<RawClassData[]> {
    const apiKey = process.env.CLUBREADY_API_KEY;

    if (!apiKey) {
      console.warn(`ClubReady API key not configured for ${this.studioName}. Using mock data.`);
      return this.getMockData(date);
    }

    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // ClubReady API V2 endpoint
      const url = new URL('https://www.clubready.com/api/current/json/reply/GetClassScheduleRequestV2');
      url.searchParams.append('ApiKey', apiKey);
      url.searchParams.append('StoreId', this.clubReadyStoreId);
      url.searchParams.append('StartDate', startDate.toISOString());
      url.searchParams.append('EndDate', endDate.toISOString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`ClubReady API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseClubReadyResponse(data);
    } catch (error) {
      console.error(`Error fetching from ClubReady for ${this.studioName}:`, error);
      // Fallback to mock data
      return this.getMockData(date);
    }
  }

  /**
   * Parse ClubReady API response into RawClassData format
   */
  protected parseClubReadyResponse(data: any): RawClassData[] {
    if (!data.Classes || !Array.isArray(data.Classes)) {
      return [];
    }

    return data.Classes.map((classItem: any) => ({
      id: `${this.studioId}-${classItem.ClassId || classItem.Id}`,
      name: classItem.ClassName || classItem.Name,
      instructor: classItem.InstructorName || classItem.Instructor || 'TBD',
      startTime: new Date(classItem.StartTime),
      endTime: new Date(classItem.EndTime),
      duration: classItem.Duration || this.calculateDuration(classItem.StartTime, classItem.EndTime),
      capacity: classItem.Capacity,
      spotsAvailable: classItem.SpotsAvailable || classItem.Available,
      level: classItem.Level || classItem.DifficultyLevel,
      location: classItem.StudioLocation || classItem.Location,
      bookingUrl: classItem.BookingUrl || `https://www.clubready.com/book/${this.clubReadyStoreId}`,
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
   * Normalize ClubReady data to standard format
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
