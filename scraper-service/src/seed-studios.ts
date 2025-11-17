import { prisma } from './db/client';

/**
 * Seed database with Bay Area studio locations
 */
async function seedStudios() {
  console.log('Seeding Bay Area studio locations...\n');

  // Club Pilates locations
  const clubPilatesLocations = [
    {
      id: 'club-pilates-sf-marina',
      name: 'Club Pilates San Francisco - Marina',
      brand: 'Club Pilates',
      location: 'San Francisco',
      address: '2162 Chestnut St, San Francisco, CA 94123',
      latitude: 37.7989,
      longitude: -122.4371,
      websiteUrl: 'https://www.clubpilates.com/location/san-francisco-marina',
      phoneNumber: '(415) 555-0101',
    },
    {
      id: 'club-pilates-oakland',
      name: 'Club Pilates Oakland - Montclair',
      brand: 'Club Pilates',
      location: 'Oakland',
      address: '6255 Moraga Ave, Oakland, CA 94611',
      latitude: 37.8364,
      longitude: -122.2114,
      websiteUrl: 'https://www.clubpilates.com/location/oakland-montclair',
      phoneNumber: '(510) 555-0102',
    },
    {
      id: 'club-pilates-palo-alto',
      name: 'Club Pilates Palo Alto',
      brand: 'Club Pilates',
      location: 'Palo Alto',
      address: '855 El Camino Real, Palo Alto, CA 94301',
      latitude: 37.4419,
      longitude: -122.1419,
      websiteUrl: 'https://www.clubpilates.com/location/palo-alto',
      phoneNumber: '(650) 555-0103',
    },
    {
      id: 'club-pilates-walnut-creek',
      name: 'Club Pilates Walnut Creek',
      brand: 'Club Pilates',
      location: 'Walnut Creek',
      address: '1378 N Main St, Walnut Creek, CA 94596',
      latitude: 37.9101,
      longitude: -122.0652,
      websiteUrl: 'https://www.clubpilates.com/location/walnut-creek',
      phoneNumber: '(925) 555-0104',
    },
    {
      id: 'club-pilates-san-jose',
      name: 'Club Pilates San Jose - Willow Glen',
      brand: 'Club Pilates',
      location: 'San Jose',
      address: '1082 Willow St, San Jose, CA 95125',
      latitude: 37.3022,
      longitude: -121.8905,
      websiteUrl: 'https://www.clubpilates.com/location/san-jose-willow-glen',
      phoneNumber: '(408) 555-0105',
    },
  ];

  // Upsert all studios
  for (const studio of clubPilatesLocations) {
    await prisma.studio.upsert({
      where: { id: studio.id },
      update: studio,
      create: studio,
    });
    console.log(`✓ ${studio.name}`);
  }

  console.log(`\nSeeded ${clubPilatesLocations.length} Club Pilates studios`);

  // CycleBar locations
  const cycleBarLocations = [
    {
      id: 'cyclebar-sf-soma',
      name: 'CycleBar San Francisco - SoMa',
      brand: 'CycleBar',
      location: 'San Francisco',
      address: '301 Howard St, San Francisco, CA 94105',
      latitude: 37.7903,
      longitude: -122.3968,
      websiteUrl: 'https://www.cyclebar.com/location/san-francisco-soma',
      phoneNumber: '(415) 555-0201',
    },
    {
      id: 'cyclebar-oakland-uptown',
      name: 'CycleBar Oakland - Uptown',
      brand: 'CycleBar',
      location: 'Oakland',
      address: '1960 Broadway, Oakland, CA 94612',
      latitude: 37.8089,
      longitude: -122.2711,
      websiteUrl: 'https://www.cyclebar.com/location/oakland-uptown',
      phoneNumber: '(510) 555-0202',
    },
    {
      id: 'cyclebar-mountain-view',
      name: 'CycleBar Mountain View',
      brand: 'CycleBar',
      location: 'Mountain View',
      address: '2600 El Camino Real, Mountain View, CA 94040',
      latitude: 37.4052,
      longitude: -122.1143,
      websiteUrl: 'https://www.cyclebar.com/location/mountain-view',
      phoneNumber: '(650) 555-0203',
    },
  ];

  for (const studio of cycleBarLocations) {
    await prisma.studio.upsert({
      where: { id: studio.id },
      update: studio,
      create: studio,
    });
    console.log(`✓ ${studio.name}`);
  }

  console.log(`\nSeeded ${cycleBarLocations.length} CycleBar studios`);
}

async function main() {
  try {
    await seedStudios();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
