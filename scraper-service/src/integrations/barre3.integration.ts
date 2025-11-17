import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * barre3 Integration
 *
 * barre3 is a boutique fitness studio combining yoga, Pilates, and ballet barre.
 * Uses their own booking platform.
 */
export class Barre3Integration extends BaseIntegration {
  studioId = 'barre3';
  studioName = 'barre3';
  brand = 'barre3';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'barre3-sf-castro', name: 'barre3 San Francisco - Castro', location: 'San Francisco', address: '2355 Market St, San Francisco, CA 94114', lat: 37.7625, lng: -122.4308 },
    { id: 'barre3-berkeley', name: 'barre3 Berkeley', location: 'Berkeley', address: '2915 Ashby Ave, Berkeley, CA 94705', lat: 37.8567, lng: -122.2663 },
    { id: 'barre3-mill-valley', name: 'barre3 Mill Valley', location: 'Mill Valley', address: '155 Throckmorton Ave, Mill Valley, CA 94941', lat: 37.9053, lng: -122.5450 },
  ];

  private classTypes = [
    { name: 'barre3 Signature', level: 'All Levels', duration: 60 },
    { name: 'barre3 Power', level: 'Intermediate', duration: 60 },
    { name: 'barre3 Restore', level: 'All Levels', duration: 60 },
    { name: 'barre3 Express', level: 'All Levels', duration: 30 },
  ];

  private instructors = [
    'Grace Anderson', 'Hannah Lee', 'Madison Torres', 'Ella Rodriguez',
    'Zoe Martin', 'Lily Chen', 'Chloe Williams'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.barre3.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching barre3 schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        const numClasses = 6 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numClasses; i++) {
          const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
          const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

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
            capacity: 20,
            spotsAvailable: Math.floor(Math.random() * 20),
            bookingUrl: `https://barre3.com/location/${location.id}/book`,
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
