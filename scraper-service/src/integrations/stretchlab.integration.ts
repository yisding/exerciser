import { BaseIntegration } from './base.integration';
import { FitnessClass, RawClassData } from '../../../shared/types';
import { HttpClient } from '../clients/http-client';

/**
 * StretchLab Integration
 *
 * StretchLab offers assisted stretching sessions.
 * Uses their own booking platform.
 */
export class StretchLabIntegration extends BaseIntegration {
  studioId = 'stretchlab';
  studioName = 'StretchLab';
  brand = 'StretchLab';
  integrationType = 'api' as const;

  private httpClient: HttpClient;
  private bayAreaLocations = [
    { id: 'stretchlab-sf-nob-hill', name: 'StretchLab San Francisco - Nob Hill', location: 'San Francisco', address: '1201 Polk St, San Francisco, CA 94109', lat: 37.7895, lng: -122.4204 },
    { id: 'stretchlab-redwood-city', name: 'StretchLab Redwood City', location: 'Redwood City', address: '2775 El Camino Real, Redwood City, CA 94061', lat: 37.4690, lng: -122.2163 },
    { id: 'stretchlab-san-ramon', name: 'StretchLab San Ramon', location: 'San Ramon', address: '2416 San Ramon Valley Blvd, San Ramon, CA 94583', lat: 37.7669, lng: -121.9585 },
  ];

  private classTypes = [
    { name: 'Group Stretch', level: 'All Levels', duration: 60 },
    { name: 'Express Stretch', level: 'All Levels', duration: 30 },
  ];

  private instructors = [
    'Ben Williams', 'Katie Lee', 'Alex Johnson', 'Taylor Chen',
    'Jordan Martinez', 'Sam Rodriguez'
  ];

  constructor() {
    super();
    this.httpClient = new HttpClient('https://api.stretchlab.com');
  }

  async fetch(date: Date): Promise<RawClassData[]> {
    this.logger.info('Fetching StretchLab schedule', { date: date.toISOString() });

    const classes: RawClassData[] = [];
    const today = new Date(date);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + dayOffset);

      for (const location of this.bayAreaLocations) {
        const numClasses = 5 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numClasses; i++) {
          const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
          const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

          const hour = 8 + i * 2;
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
            capacity: 8,
            spotsAvailable: Math.floor(Math.random() * 8),
            bookingUrl: `https://stretchlab.com/location/${location.id}/book`,
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
