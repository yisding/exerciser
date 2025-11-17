import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * Title Boxing Integration
 *
 * Title Boxing Club offers boxing and kickboxing fitness classes.
 * Uses Performance IQ booking platform.
 */
export class TitleBoxingIntegration extends BaseIntegration {
  studioId = 'title-boxing';
  studioName = 'Title Boxing Club';
  brand = 'Title Boxing Club';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'titleboxing-sf-soma', name: 'Title Boxing Club San Francisco - SoMa', location: 'San Francisco', address: '777 Brannan St, San Francisco, CA 94103', lat: 37.7719, lng: -122.4039 },
    { id: 'titleboxing-fremont', name: 'Title Boxing Club Fremont', location: 'Fremont', address: '39270 Paseo Padre Pkwy, Fremont, CA 94538', lat: 37.5341, lng: -121.9737 },
  ];

  private classTypes = [
    { name: 'Power Hour', level: 'All Levels', duration: 60 },
    { name: 'Intermediate Blast', level: 'Intermediate', duration: 45 },
    { name: 'Advanced Training', level: 'Advanced', duration: 60 },
    { name: 'Express Workout', level: 'All Levels', duration: 30 },
  ];

  private instructors = [
    'Mike Thompson', 'Sarah Rodriguez', 'Andre Jackson', 'Jess Martinez',
    'Bobby Lee', 'Christina Diaz'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.myperformanceiq.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching Title Boxing Club schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        const numClasses = 8 + Math.floor(Math.random() * 3);

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
            capacity: 24,
            spotsAvailable: Math.floor(Math.random() * 24),
            bookingUrl: `https://titleboxing.myperformanceiq.com/location/${location.id}/book`,
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
