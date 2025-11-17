import { ClubPilatesIntegration } from './integrations/club-pilates.integration';
import { CycleBarIntegration } from './integrations/cyclebar.integration';
import { writeScrapeResults } from './db/writer';
import { prisma } from './db/client';

async function runIntegration(brand: string) {
  console.log(`\n🏃 Running ${brand} integration...\n`);

  let integration;

  switch (brand.toLowerCase()) {
    case 'club-pilates':
      integration = new ClubPilatesIntegration();
      break;
    case 'cyclebar':
      integration = new CycleBarIntegration();
      break;
    default:
      console.error(`❌ Unknown brand: ${brand}`);
      console.log('Available brands: club-pilates, cyclebar');
      process.exit(1);
  }

  try {
    // Run the integration
    const result = await integration.run();

    console.log(`\n📊 Integration Result:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Classes: ${result.classCount}`);
    console.log(`   Message: ${result.message}\n`);

    if (result.status === 'success') {
      // Write to database
      await writeScrapeResults(result);
      console.log('✅ Data written to database successfully!\n');

      // Show stats
      const totalClasses = await prisma.fitnessClass.count({
        where: {
          studio: {
            brand: integration.brand,
          },
        },
      });

      const totalStudios = await prisma.studio.count({
        where: {
          brand: integration.brand,
        },
      });

      console.log(`📈 Database Stats for ${integration.brand}:`);
      console.log(`   Studios: ${totalStudios}`);
      console.log(`   Classes: ${totalClasses}\n`);
    }
  } catch (error) {
    console.error('❌ Integration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get brand from command line argument
const brand = process.argv[2];

if (!brand) {
  console.error('Usage: ts-node run-integration.ts <brand>');
  console.log('Example: ts-node run-integration.ts club-pilates');
  process.exit(1);
}

runIntegration(brand);
