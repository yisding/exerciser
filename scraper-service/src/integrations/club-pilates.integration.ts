import { ClubReadyIntegration } from './base/clubready-integration';
import { RawClassData } from '../../../shared/types';

/**
 * Club Pilates Integration
 *
 * Club Pilates is part of the Xponential Fitness family and uses the ClubReady platform.
 *
 * API Documentation: https://developer.clubready.com/
 * Platform: ClubReady
 *
 * To enable real data:
 * 1. Request API access from support@clubready.com
 * 2. Add CLUBREADY_API_KEY to .env
 * 3. Configure store IDs for each location
 */
export class ClubPilatesIntegration extends ClubReadyIntegration {
  studioId = 'club-pilates';
  studioName = 'Club Pilates';
  brand = 'Club Pilates';

  // ClubReady Store ID - needs to be obtained from ClubReady
  // For now using a placeholder
  protected clubReadyStoreId = process.env.CLUBREADY_STORE_ID_CLUB_PILATES || 'PLACEHOLDER';

  private bayAreaLocations = [
    { id: 'club-pilates-sf-marina', name: 'Club Pilates San Francisco - Marina', location: 'San Francisco', address: '2162 Chestnut St, San Francisco, CA 94123' },
    { id: 'club-pilates-oakland', name: 'Club Pilates Oakland - Montclair', location: 'Oakland', address: '6255 Moraga Ave, Oakland, CA 94611' },
    { id: 'club-pilates-palo-alto', name: 'Club Pilates Palo Alto', location: 'Palo Alto', address: '855 El Camino Real, Palo Alto, CA 94301' },
    { id: 'club-pilates-walnut-creek', name: 'Club Pilates Walnut Creek', location: 'Walnut Creek', address: '1378 N Main St, Walnut Creek, CA 94596' },
    { id: 'club-pilates-san-jose', name: 'Club Pilates San Jose - Willow Glen', location: 'San Jose', address: '1082 Willow St, San Jose, CA 95125' },
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

  /**
   * Generate mock data for development/testing
   * This will be used when ClubReady API credentials are not available
   */
  protected getMockData(date: Date): RawClassData[] {
    const classes: RawClassData[] = [];
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // Each location has 6-8 classes per day
    for (const location of this.bayAreaLocations) {
      const numClasses = 6 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numClasses; i++) {
        const classType = this.classTypes[Math.floor(Math.random() * this.classTypes.length)];
        const instructor = this.instructors[Math.floor(Math.random() * this.instructors.length)];

        // Class times: 6 AM - 8 PM
        const hour = 6 + i * 2;
        const minute = [0, 30][Math.floor(Math.random() * 2)];

        const startTime = new Date(startDate);
        startTime.setHours(hour, minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + classType.duration);

        classes.push({
          id: `${location.id}-${startTime.getTime()}-${classType.name.replace(/\s/g, '-')}`,
          name: classType.name,
          instructor: instructor,
          startTime: startTime,
          endTime: endTime,
          duration: classType.duration,
          capacity: 12,
          spotsAvailable: Math.floor(Math.random() * 12),
          level: classType.level,
          location: location.location,
          bookingUrl: `https://www.clubpilates.com/location/${location.id}/book`,
        });
      }
    }

    return classes;
  }
}
