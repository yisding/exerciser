/**
 * Test script for web-based integrations
 *
 * This script tests the web scraping/API discovery approach for a single integration
 */

import { ClubPilatesWebIntegration } from './integrations/club-pilates-web.integration';

async function testIntegration() {
  console.log('=== Testing Club Pilates Web Integration ===\n');

  const integration = new ClubPilatesWebIntegration();

  try {
    const today = new Date();
    console.log(`Fetching classes for: ${today.toDateString()}\n`);

    // Fetch raw data
    console.log('Step 1: Fetching data...');
    const rawData = await integration.fetch(today);
    console.log(`✓ Fetched ${rawData.length} classes\n`);

    if (rawData.length > 0) {
      // Show first few classes
      console.log('Sample classes:');
      rawData.slice(0, 3).forEach((cls, i) => {
        console.log(`\n${i + 1}. ${cls.name}`);
        console.log(`   Instructor: ${cls.instructor}`);
        console.log(`   Time: ${cls.startTime instanceof Date ? cls.startTime.toLocaleTimeString() : cls.startTime}`);
        console.log(`   Duration: ${cls.duration} min`);
        console.log(`   Level: ${cls.level}`);
      });

      // Normalize data
      console.log('\n\nStep 2: Normalizing data...');
      const normalized = integration.normalize(rawData);
      console.log(`✓ Normalized ${normalized.length} classes\n`);

      // Show normalized format
      if (normalized.length > 0) {
        console.log('Sample normalized class:');
        console.log(JSON.stringify(normalized[0], null, 2));
      }
    }

    // Cleanup
    await integration.cleanup();
    console.log('\n✓ Test completed successfully!');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    await integration.cleanup();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  testIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { testIntegration };
