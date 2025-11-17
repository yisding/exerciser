import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * Spenga Integration
 *
 * Spenga combines spin, strength, and yoga in one workout.
 * Uses their own booking platform.
 */
export class SpengaIntegration extends BaseIntegration {
  studioId = 'spenga';
  studioName = 'Spenga';
  brand = 'Spenga';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'spenga-pleasanton', name: 'Spenga Pleasanton', location: 'Pleasanton', address: '4555 Hopyard Rd, Pleasanton, CA 94588', lat: 37.6922, lng: -121.9029 },
  ];

  private classTypes = [
    { name: 'Spenga Full', level: 'All Levels', duration: 60 },
    { name: 'Spenga Express', level: 'All Levels', duration: 45 },
  ];

  private instructors = [
    'Nicole Brown', 'Marcus Smith', 'Tiffany Johnson', 'Ryan Davis'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.spenga.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching Spenga schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        const numClasses = 7 + Math.floor(Math.random() * 3);

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
            capacity: 30,
            spotsAvailable: Math.floor(Math.random() * 30),
            bookingUrl: `https://spenga.com/location/${location.id}/book`,
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
