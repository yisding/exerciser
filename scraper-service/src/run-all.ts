import { Orchestrator } from './integrations/orchestrator';
import { prisma } from './db/client';

async function main() {
  console.log('\n🎯 Running all integrations...\n');

  const orchestrator = new Orchestrator();

  try {
    await orchestrator.runAll();

    // Show overall stats
    const totalStudios = await prisma.studio.count();
    const totalClasses = await prisma.fitnessClass.count();
    const brands = await prisma.studio.groupBy({
      by: ['brand'],
      _count: { brand: true },
    });

    console.log('\n📊 Overall Database Stats:');
    console.log(`   Total Studios: ${totalStudios}`);
    console.log(`   Total Classes: ${totalClasses}`);
    console.log('\n   By Brand:');
    for (const brand of brands) {
      const classCount = await prisma.fitnessClass.count({
        where: { studio: { brand: brand.brand } },
      });
      console.log(`   - ${brand.brand}: ${brand._count.brand} studios, ${classCount} classes`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Error running integrations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
