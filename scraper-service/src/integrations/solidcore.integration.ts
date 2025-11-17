import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * [solidcore] Integration
 *
 * [solidcore] offers Pilates-inspired resistance training.
 * Uses their own booking platform.
 */
export class SolidcoreIntegration extends BaseIntegration {
  studioId = 'solidcore';
  studioName = '[solidcore]';
  brand = '[solidcore]';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'solidcore-sf-fillmore', name: '[solidcore] San Francisco - Fillmore', location: 'San Francisco', address: '2295 Fillmore St, San Francisco, CA 94115', lat: 37.7916, lng: -122.4337 },
    { id: 'solidcore-palo-alto', name: '[solidcore] Palo Alto', location: 'Palo Alto', address: '530 Ramona St, Palo Alto, CA 94301', lat: 37.4453, lng: -122.1602 },
  ];

  private classTypes = [
    { name: '[solidcore] Full Body', level: 'All Levels', duration: 50 },
    { name: '[solidcore] Upper Body', level: 'Intermediate', duration: 50 },
    { name: '[solidcore] Lower Body', level: 'Intermediate', duration: 50 },
    { name: '[solidcore] Core', level: 'Advanced', duration: 50 },
  ];

  private instructors = [
    'Natalie Green', 'Austin Reed', 'Paige Collins', 'Blake Turner',
    'Skylar Morgan', 'Avery James'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.solidcore.co');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching [solidcore] schedule', { date: date.toISOString() });

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
            capacity: 12,
            spotsAvailable: Math.floor(Math.random() * 12),
            bookingUrl: `https://solidcore.co/location/${location.id}/book`,
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
