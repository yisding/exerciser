import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * Club Pilates Integration
 *
 * Club Pilates is part of the Xponential Fitness family (along with CycleBar,
 * Row House, Pure Barre, YogaSix, etc.) and uses a unified booking platform.
 *
 * This integration demonstrates the API-based approach. In production, you would:
 * 1. Use DevTools Network tab to discover the actual API endpoints
 * 2. Extract the authentication mechanism (API keys, session tokens, etc.)
 * 3. Make HTTP requests to the real endpoints
 *
 * For this demo, we simulate realistic API responses with Bay Area locations.
 */
export class ClubPilatesIntegration extends BaseIntegration {
  studioId = 'club-pilates';
  studioName = 'Club Pilates';
  brand = 'Club Pilates';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'club-pilates-sf-marina', name: 'Club Pilates San Francisco - Marina', location: 'San Francisco', address: '2162 Chestnut St, San Francisco, CA 94123', lat: 37.7989, lng: -122.4371 },
    { id: 'club-pilates-oakland', name: 'Club Pilates Oakland - Montclair', location: 'Oakland', address: '6255 Moraga Ave, Oakland, CA 94611', lat: 37.8364, lng: -122.2114 },
    { id: 'club-pilates-palo-alto', name: 'Club Pilates Palo Alto', location: 'Palo Alto', address: '855 El Camino Real, Palo Alto, CA 94301', lat: 37.4419, lng: -122.1419 },
    { id: 'club-pilates-walnut-creek', name: 'Club Pilates Walnut Creek', location: 'Walnut Creek', address: '1378 N Main St, Walnut Creek, CA 94596', lat: 37.9101, lng: -122.0652 },
    { id: 'club-pilates-san-jose', name: 'Club Pilates San Jose - Willow Glen', location: 'San Jose', address: '1082 Willow St, San Jose, CA 95125', lat: 37.3022, lng: -121.8905 },
  ];

  private classTypes = [
    { name: 'Reformer Flow', level: 'All Levels', duration: 50 },
    { name: 'Center + Balance', level: 'Beginner', duration: 50 },
    { name: 'Control', level: 'Intermediate', duration: 50 },
    { name: 'Cardio Sculpt', level: 'Advanced', duration: 50 },
    { name: 'Restore', level: 'All Levels', duration: 50 },
    { name: 'TRX Pilates', level: 'Intermediate', duration: 50 },
  ];

  private instructors = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Park',
    'Jessica Williams', 'Ryan Martinez', 'Amanda Thompson', 'Kevin Lee'
  ];

  constructor() {
    super();
    // In production, this would point to the actual Xponential API
    this.httpClient = new HttpClient('https://api.xponential.com');
  }

  /**
   * Fetch class schedule data
   * In production, this would make real API calls to discover endpoints
   */
  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching Club Pilates schedule', { date: date.toISOString() });

    // PRODUCTION APPROACH:
    // const response = await this.httpClient.get('/schedule', {
    //   params: {
    //     brand: 'club-pilates',
    //     date: date.toISOString(),
    //     region: 'bay-area'
    //   }
    // });
    // return response.classes;

    // DEMO: Generate realistic schedule data
    const classes: RawClassData[] = [];
    const today = new Date(date);

    // Generate classes for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      // Each location has 6-8 classes per day
      for (const location of this.bayAreaLocations) {
        const numClasses = 6 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numClasses; i++) {
          const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
          const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

          // Class times: 6 AM - 8 PM
          const hour = 6 + i * 2;
          const minute = [0, 30][Math.floor(Math.random() * 2)];

          const startTime = new Date(classDate);
          startTime.setHours(hour, minute, 0, 0);

          classes.push({
            locationId: location.id,
            locationName: location.name,
            locationAddress: location.address,
            locationCity: location.location,
            latitude: location.lat,
            longitude: location.lng,
            className: classType.name,
            instructor: instructor,
            startTime: startTime.toISOString(),
            duration: classType.duration,
            level: classType.level,
            capacity: 12,
            spotsAvailable: Math.floor(Math.random() * 12),
            bookingUrl: `https://www.clubpilates.com/location/${location.id}/book`,
          });
        }
      }
    }

    this.logger.info(`Fetched ${classes.length} classes from ${this.bayAreaLocations.length} locations`);
    return classes;
  }

  /**
   * Normalize raw API data to our standard FitnessClass format
   */
  normalize(rawData: RawClassData[]): FitnessClass[] {
    return rawData.map((raw) => {
      const startTime = new Date(raw.startTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + raw.duration);

      return {
        id: `${raw.locationId}-${startTime.getTime()}-${raw.className.replace(/\s/g, '-')}`,
        studioId: raw.locationId,
        className: raw.className,
        instructor: raw.instructor,
        startTime,
        endTime,
        duration: raw.duration,
        capacity: raw.capacity,
        spotsAvailable: raw.spotsAvailable,
        level: raw.level,
        bookingUrl: raw.bookingUrl,
      };
    });
  }
}
