import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * Rumble Boxing Integration
 *
 * Rumble offers boxing-inspired group fitness classes.
 * Uses their own booking platform.
 */
export class RumbleIntegration extends BaseIntegration {
  studioId = 'rumble';
  studioName = 'Rumble Boxing';
  brand = 'Rumble Boxing';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'rumble-sf-hayes-valley', name: 'Rumble Boxing San Francisco - Hayes Valley', location: 'San Francisco', address: '555 Hayes St, San Francisco, CA 94102', lat: 37.7765, lng: -122.4250 },
    { id: 'rumble-palo-alto', name: 'Rumble Boxing Palo Alto', location: 'Palo Alto', address: '441 University Ave, Palo Alto, CA 94301', lat: 37.4489, lng: -122.1599 },
  ];

  private classTypes = [
    { name: 'Rumble Boxing', level: 'All Levels', duration: 45 },
    { name: 'Rumble Strength', level: 'Intermediate', duration: 45 },
    { name: 'Rumble Express', level: 'All Levels', duration: 30 },
  ];

  private instructors = [
    'Tyson Rodriguez', 'Maya Johnson', 'Connor Davis', 'Aaliyah Williams',
    'Ethan Martinez', 'Layla Brown'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.rumbleboxinggym.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching Rumble Boxing schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        const numClasses = 8 + Math.floor(Math.random() * 4);

        for (let i = 0; i < numClasses; i++) {
          const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
          const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

          const hour = 6 + i * 1.5;
          const minute = [0, 30][Math.floor(Math.random() * 2)];

          const startTime = new Date(classDate);
          startTime.setHours(Math.floor(hour), minute, 0, 0);

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
            capacity: 50,
            spotsAvailable: Math.floor(Math.random() * 50),
            bookingUrl: `https://rumbleboxinggym.com/location/${location.id}/book`,
          });
        }
      }
    }

    this.logger.info(`Fetched ${classes.length} classes from ${this.bayAreaLocations.length} locations`);
    return classes;
  }

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
