// Test integration - a simple mock integration for testing the setup

import { BaseIntegration } from './integrations/base.integration';
import { FitnessClass, RawClassData } from '../../shared/types';
import { prisma } from './db/client';
import { writeScrapeResults } from './db/writer';

class TestIntegration extends BaseIntegration {
  studioId = 'test-studio-1';
  studioName = 'Test Studio';
  brand = 'TestBrand';
  integrationType = 'api' as const;

  async fetch(date: Date): Promise<RawClassData[]> {
    // Return mock data
    return [
      {
        name: 'Test Yoga Class',
        instructor: 'John Doe',
        time: '10:00 AM',
        duration: 60,
      },
      {
        name: 'Test Pilates Class',
        instructor: 'Jane Smith',
        time: '2:00 PM',
        duration: 45,
      },
    ];
  }

  normalize(rawData: RawClassData[]): FitnessClass[] {
    const now = new Date();
    return rawData.map((data, index) => {
      const startTime = new Date(now);
      startTime.setHours(index === 0 ? 10 : 14, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + data.duration);

      return {
        id: `test-class-${index + 1}`,
        studioId: this.studioId,
        className: data.name,
        instructor: data.instructor,
        startTime,
        endTime,
        duration: data.duration,
        capacity: 20,
        spotsAvailable: 15,
        level: 'All Levels',
      };
    });
  }
}

async function main() {
  console.log('Starting test integration...\n');

  // Ensure test studio exists
  await prisma.studio.upsert({
    where: { id: 'test-studio-1' },
    update: {},
    create: {
      id: 'test-studio-1',
      name: 'Test Studio',
      brand: 'TestBrand',
      location: 'San Francisco',
      address: '123 Test St, San Francisco, CA 94102',
    },
  });

  console.log('Test studio created/verified\n');

  // Run the integration
  const integration = new TestIntegration();
  const result = await integration.run();

  console.log('\nIntegration Result:', result);

  // Write to database
  if (result.status === 'success') {
    await writeScrapeResults(result);
    console.log('\nData written to database successfully!');

    // Verify data was written
    const classes = await prisma.fitnessClass.findMany({
      where: { studioId: 'test-studio-1' },
    });
    console.log(`\nFound ${classes.length} classes in database:`);
    classes.forEach((cls: any) => {
      console.log(`- ${cls.className} at ${cls.startTime.toLocaleTimeString()}`);
    });
  }

  await prisma.$disconnect();
  console.log('\nTest completed!');
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
