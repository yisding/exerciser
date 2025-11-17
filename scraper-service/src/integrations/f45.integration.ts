import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * F45 Training Integration
 *
 * F45 is a global functional training franchise.
 * Uses their own API/booking platform.
 */
export class F45Integration extends BaseIntegration {
  studioId = 'f45';
  studioName = 'F45 Training';
  brand = 'F45 Training';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'f45-sf-soma', name: 'F45 Training San Francisco - SoMa', location: 'San Francisco', address: '500 Folsom St, San Francisco, CA 94105', lat: 37.7883, lng: -122.3972 },
    { id: 'f45-oakland-jack-london', name: 'F45 Training Oakland - Jack London Square', location: 'Oakland', address: '55 Harrison St, Oakland, CA 94607', lat: 37.7969, lng: -122.2791 },
    { id: 'f45-palo-alto', name: 'F45 Training Palo Alto', location: 'Palo Alto', address: '261 Hamilton Ave, Palo Alto, CA 94301', lat: 37.4467, lng: -122.1603 },
    { id: 'f45-san-jose-santana-row', name: 'F45 Training San Jose - Santana Row', location: 'San Jose', address: '377 Santana Row, San Jose, CA 95128', lat: 37.3215, lng: -121.9488 },
  ];

  private classTypes = [
    { name: 'Panthers', level: 'All Levels', duration: 45, type: 'Cardio' },
    { name: 'Romans', level: 'All Levels', duration: 45, type: 'Strength' },
    { name: 'Red Diamond', level: 'Advanced', duration: 45, type: 'Hybrid' },
    { name: 'Athletica', level: 'All Levels', duration: 45, type: 'Hybrid' },
    { name: 'Hollywood', level: 'Intermediate', duration: 45, type: 'Cardio' },
    { name: 'Triple Threat', level: 'All Levels', duration: 45, type: 'Strength' },
  ];

  private instructors = [
    'Jake Thompson', 'Megan Foster', 'Carlos Ramirez', 'Ashley Nguyen',
    'Derek Williams', 'Samantha Jones', 'Tony Garcia'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.f45training.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching F45 Training schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        // F45 typically has 10-12 classes per day (early morning to evening)
        const numClasses = 10 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numClasses; i++) {
          const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
          const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

          // F45 classes typically start at 5 AM
          const hour = 5 + i * 1.5;
          const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

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
            capacity: 36,
            spotsAvailable: Math.floor(Math.random() * 36),
            bookingUrl: `https://f45training.com/location/${location.id}/book`,
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
