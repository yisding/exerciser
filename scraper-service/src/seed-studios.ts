import 'dotenv/config';
import { prisma } from './db/client';

/**
 * Seed database with all Bay Area studio locations across all 13 brands
 */
async function seedStudios() {
  console.log('Seeding Bay Area studio locations...\n');

  const allStudios = [
    // Club Pilates locations (Xponential)
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

    // CycleBar locations (Xponential)
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

    // Row House locations (Xponential)
    {
      id: 'rowhouse-sf-fidi',
      name: 'Row House San Francisco - FiDi',
      brand: 'Row House',
      location: 'San Francisco',
      address: '100 Pine St, San Francisco, CA 94111',
      latitude: 37.7922,
      longitude: -122.3991,
      websiteUrl: 'https://www.therowhouse.com/location/san-francisco-fidi',
      phoneNumber: '(415) 555-0301',
    },
    {
      id: 'rowhouse-berkeley',
      name: 'Row House Berkeley',
      brand: 'Row House',
      location: 'Berkeley',
      address: '2323 Shattuck Ave, Berkeley, CA 94704',
      latitude: 37.8680,
      longitude: -122.2681,
      websiteUrl: 'https://www.therowhouse.com/location/berkeley',
      phoneNumber: '(510) 555-0302',
    },
    {
      id: 'rowhouse-sunnyvale',
      name: 'Row House Sunnyvale',
      brand: 'Row House',
      location: 'Sunnyvale',
      address: '1075 S Wolfe Rd, Sunnyvale, CA 94086',
      latitude: 37.3688,
      longitude: -122.0147,
      websiteUrl: 'https://www.therowhouse.com/location/sunnyvale',
      phoneNumber: '(408) 555-0303',
    },

    // Pure Barre locations (Xponential)
    {
      id: 'purebarre-sf-pacific-heights',
      name: 'Pure Barre San Francisco - Pacific Heights',
      brand: 'Pure Barre',
      location: 'San Francisco',
      address: '2111 Fillmore St, San Francisco, CA 94115',
      latitude: 37.7907,
      longitude: -122.4340,
      websiteUrl: 'https://www.purebarre.com/location/san-francisco-pacific-heights',
      phoneNumber: '(415) 555-0401',
    },
    {
      id: 'purebarre-oakland-rockridge',
      name: 'Pure Barre Oakland - Rockridge',
      brand: 'Pure Barre',
      location: 'Oakland',
      address: '5625 College Ave, Oakland, CA 94618',
      latitude: 37.8450,
      longitude: -122.2513,
      websiteUrl: 'https://www.purebarre.com/location/oakland-rockridge',
      phoneNumber: '(510) 555-0402',
    },
    {
      id: 'purebarre-los-gatos',
      name: 'Pure Barre Los Gatos',
      brand: 'Pure Barre',
      location: 'Los Gatos',
      address: '15466 Los Gatos Blvd, Los Gatos, CA 95032',
      latitude: 37.2284,
      longitude: -121.9613,
      websiteUrl: 'https://www.purebarre.com/location/los-gatos',
      phoneNumber: '(408) 555-0403',
    },
    {
      id: 'purebarre-menlo-park',
      name: 'Pure Barre Menlo Park',
      brand: 'Pure Barre',
      location: 'Menlo Park',
      address: '720 Menlo Ave, Menlo Park, CA 94025',
      latitude: 37.4519,
      longitude: -122.1817,
      websiteUrl: 'https://www.purebarre.com/location/menlo-park',
      phoneNumber: '(650) 555-0404',
    },

    // YogaSix locations (Xponential)
    {
      id: 'yogasix-sf-mission-bay',
      name: 'YogaSix San Francisco - Mission Bay',
      brand: 'YogaSix',
      location: 'San Francisco',
      address: '185 Berry St, San Francisco, CA 94107',
      latitude: 37.7764,
      longitude: -122.3947,
      websiteUrl: 'https://www.yogasix.com/location/san-francisco-mission-bay',
      phoneNumber: '(415) 555-0501',
    },
    {
      id: 'yogasix-walnut-creek',
      name: 'YogaSix Walnut Creek',
      brand: 'YogaSix',
      location: 'Walnut Creek',
      address: '1428 N Main St, Walnut Creek, CA 94596',
      latitude: 37.9106,
      longitude: -122.0651,
      websiteUrl: 'https://www.yogasix.com/location/walnut-creek',
      phoneNumber: '(925) 555-0502',
    },
    {
      id: 'yogasix-san-mateo',
      name: 'YogaSix San Mateo',
      brand: 'YogaSix',
      location: 'San Mateo',
      address: '120 E 3rd Ave, San Mateo, CA 94401',
      latitude: 37.5636,
      longitude: -122.3233,
      websiteUrl: 'https://www.yogasix.com/location/san-mateo',
      phoneNumber: '(650) 555-0503',
    },

    // F45 Training locations
    {
      id: 'f45-sf-soma',
      name: 'F45 Training San Francisco - SoMa',
      brand: 'F45 Training',
      location: 'San Francisco',
      address: '500 Folsom St, San Francisco, CA 94105',
      latitude: 37.7883,
      longitude: -122.3972,
      websiteUrl: 'https://f45training.com/location/san-francisco-soma',
      phoneNumber: '(415) 555-0601',
    },
    {
      id: 'f45-oakland-jack-london',
      name: 'F45 Training Oakland - Jack London Square',
      brand: 'F45 Training',
      location: 'Oakland',
      address: '55 Harrison St, Oakland, CA 94607',
      latitude: 37.7969,
      longitude: -122.2791,
      websiteUrl: 'https://f45training.com/location/oakland-jack-london',
      phoneNumber: '(510) 555-0602',
    },
    {
      id: 'f45-palo-alto',
      name: 'F45 Training Palo Alto',
      brand: 'F45 Training',
      location: 'Palo Alto',
      address: '261 Hamilton Ave, Palo Alto, CA 94301',
      latitude: 37.4467,
      longitude: -122.1603,
      websiteUrl: 'https://f45training.com/location/palo-alto',
      phoneNumber: '(650) 555-0603',
    },
    {
      id: 'f45-san-jose-santana-row',
      name: 'F45 Training San Jose - Santana Row',
      brand: 'F45 Training',
      location: 'San Jose',
      address: '377 Santana Row, San Jose, CA 95128',
      latitude: 37.3215,
      longitude: -121.9488,
      websiteUrl: 'https://f45training.com/location/san-jose-santana-row',
      phoneNumber: '(408) 555-0604',
    },

    // barre3 locations
    {
      id: 'barre3-sf-castro',
      name: 'barre3 San Francisco - Castro',
      brand: 'barre3',
      location: 'San Francisco',
      address: '2355 Market St, San Francisco, CA 94114',
      latitude: 37.7625,
      longitude: -122.4308,
      websiteUrl: 'https://barre3.com/location/san-francisco-castro',
      phoneNumber: '(415) 555-0701',
    },
    {
      id: 'barre3-berkeley',
      name: 'barre3 Berkeley',
      brand: 'barre3',
      location: 'Berkeley',
      address: '2915 Ashby Ave, Berkeley, CA 94705',
      latitude: 37.8567,
      longitude: -122.2663,
      websiteUrl: 'https://barre3.com/location/berkeley',
      phoneNumber: '(510) 555-0702',
    },
    {
      id: 'barre3-mill-valley',
      name: 'barre3 Mill Valley',
      brand: 'barre3',
      location: 'Mill Valley',
      address: '155 Throckmorton Ave, Mill Valley, CA 94941',
      latitude: 37.9053,
      longitude: -122.5450,
      websiteUrl: 'https://barre3.com/location/mill-valley',
      phoneNumber: '(415) 555-0703',
    },

    // Title Boxing Club locations
    {
      id: 'titleboxing-sf-soma',
      name: 'Title Boxing Club San Francisco - SoMa',
      brand: 'Title Boxing Club',
      location: 'San Francisco',
      address: '777 Brannan St, San Francisco, CA 94103',
      latitude: 37.7719,
      longitude: -122.4039,
      websiteUrl: 'https://titleboxing.myperformanceiq.com/location/san-francisco-soma',
      phoneNumber: '(415) 555-0801',
    },
    {
      id: 'titleboxing-fremont',
      name: 'Title Boxing Club Fremont',
      brand: 'Title Boxing Club',
      location: 'Fremont',
      address: '39270 Paseo Padre Pkwy, Fremont, CA 94538',
      latitude: 37.5341,
      longitude: -121.9737,
      websiteUrl: 'https://titleboxing.myperformanceiq.com/location/fremont',
      phoneNumber: '(510) 555-0802',
    },

    // StretchLab locations
    {
      id: 'stretchlab-sf-nob-hill',
      name: 'StretchLab San Francisco - Nob Hill',
      brand: 'StretchLab',
      location: 'San Francisco',
      address: '1201 Polk St, San Francisco, CA 94109',
      latitude: 37.7895,
      longitude: -122.4204,
      websiteUrl: 'https://stretchlab.com/location/san-francisco-nob-hill',
      phoneNumber: '(415) 555-0901',
    },
    {
      id: 'stretchlab-redwood-city',
      name: 'StretchLab Redwood City',
      brand: 'StretchLab',
      location: 'Redwood City',
      address: '2775 El Camino Real, Redwood City, CA 94061',
      latitude: 37.4690,
      longitude: -122.2163,
      websiteUrl: 'https://stretchlab.com/location/redwood-city',
      phoneNumber: '(650) 555-0902',
    },
    {
      id: 'stretchlab-san-ramon',
      name: 'StretchLab San Ramon',
      brand: 'StretchLab',
      location: 'San Ramon',
      address: '2416 San Ramon Valley Blvd, San Ramon, CA 94583',
      latitude: 37.7669,
      longitude: -121.9585,
      websiteUrl: 'https://stretchlab.com/location/san-ramon',
      phoneNumber: '(925) 555-0903',
    },

    // Spenga locations
    {
      id: 'spenga-pleasanton',
      name: 'Spenga Pleasanton',
      brand: 'Spenga',
      location: 'Pleasanton',
      address: '4555 Hopyard Rd, Pleasanton, CA 94588',
      latitude: 37.6922,
      longitude: -121.9029,
      websiteUrl: 'https://spenga.com/location/pleasanton',
      phoneNumber: '(925) 555-1001',
    },

    // Rumble Boxing locations
    {
      id: 'rumble-sf-hayes-valley',
      name: 'Rumble Boxing San Francisco - Hayes Valley',
      brand: 'Rumble Boxing',
      location: 'San Francisco',
      address: '555 Hayes St, San Francisco, CA 94102',
      latitude: 37.7765,
      longitude: -122.4250,
      websiteUrl: 'https://rumbleboxinggym.com/location/san-francisco-hayes-valley',
      phoneNumber: '(415) 555-1101',
    },
    {
      id: 'rumble-palo-alto',
      name: 'Rumble Boxing Palo Alto',
      brand: 'Rumble Boxing',
      location: 'Palo Alto',
      address: '441 University Ave, Palo Alto, CA 94301',
      latitude: 37.4489,
      longitude: -122.1599,
      websiteUrl: 'https://rumbleboxinggym.com/location/palo-alto',
      phoneNumber: '(650) 555-1102',
    },

    // Jia Ren Yoga locations
    {
      id: 'jiarenyoga-sf-soma',
      name: 'Jia Ren Yoga San Francisco',
      brand: 'Jia Ren Yoga',
      location: 'San Francisco',
      address: '288 Connecticut St, San Francisco, CA 94107',
      latitude: 37.7635,
      longitude: -122.3972,
      websiteUrl: 'https://www.vagaro.com/jiarenyoga',
      phoneNumber: '(415) 555-1201',
    },

    // [solidcore] locations
    {
      id: 'solidcore-sf-fillmore',
      name: '[solidcore] San Francisco - Fillmore',
      brand: '[solidcore]',
      location: 'San Francisco',
      address: '2295 Fillmore St, San Francisco, CA 94115',
      latitude: 37.7916,
      longitude: -122.4337,
      websiteUrl: 'https://solidcore.co/location/san-francisco-fillmore',
      phoneNumber: '(415) 555-1301',
    },
    {
      id: 'solidcore-palo-alto',
      name: '[solidcore] Palo Alto',
      brand: '[solidcore]',
      location: 'Palo Alto',
      address: '530 Ramona St, Palo Alto, CA 94301',
      latitude: 37.4453,
      longitude: -122.1602,
      websiteUrl: 'https://solidcore.co/location/palo-alto',
      phoneNumber: '(650) 555-1302',
    },
  ];

  // Count studios by brand
  const brandCounts: Record<string, number> = {};
  allStudios.forEach((studio) => {
    brandCounts[studio.brand] = (brandCounts[studio.brand] || 0) + 1;
  });

  console.log('Total studios to seed:', allStudios.length);
  console.log('Breakdown by brand:');
  Object.entries(brandCounts).forEach(([brand, count]) => {
    console.log(`  - ${brand}: ${count}`);
  });
  console.log();

  // Upsert all studios
  for (const studio of allStudios) {
    await prisma.studio.upsert({
      where: { id: studio.id },
      update: studio,
      create: studio,
    });
    console.log(`✓ ${studio.name}`);
  }

  console.log(`\n✅ Seeded ${allStudios.length} studios across ${Object.keys(brandCounts).length} brands`);
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
