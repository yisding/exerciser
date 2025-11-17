import { prisma } from './client';
import { ScrapeResult } from '../../../shared/types';
import { Logger } from '../../../shared/utils/logger';

const logger = new Logger('DBWriter');

/**
 * Write scrape results to the database
 */
export async function writeScrapeResults(result: ScrapeResult): Promise<void> {
  logger.info(`Writing ${result.classCount} classes for ${result.brand}`);

  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Delete old classes for this brand (classes older than 1 day)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const deleteResult = await tx.fitnessClass.deleteMany({
        where: {
          studio: {
            brand: result.brand,
          },
          startTime: {
            lt: oneDayAgo,
          },
        },
      });

      logger.info(`Deleted ${deleteResult.count} old classes for ${result.brand}`);

      // Insert new classes
      if (result.classes.length > 0) {
        // Note: We're using createMany with skipDuplicates to avoid errors
        // This assumes each class has a unique combination that we can use
        // In production, you might want to use upsert for each class
        await tx.fitnessClass.createMany({
          data: result.classes.map((cls) => ({
            id: cls.id,
            studioId: cls.studioId,
            className: cls.className,
            instructor: cls.instructor,
            startTime: cls.startTime,
            endTime: cls.endTime,
            duration: cls.duration,
            capacity: cls.capacity,
            spotsAvailable: cls.spotsAvailable,
            level: cls.level,
            description: cls.description,
            bookingUrl: cls.bookingUrl,
          })),
          skipDuplicates: true,
        });

        logger.info(`Inserted ${result.classes.length} classes for ${result.brand}`);
      }

      // Log the scrape attempt
      await tx.scrapeLog.create({
        data: {
          brand: result.brand,
          status: result.status,
          message: result.message,
          classCount: result.classCount,
          completedAt: new Date(),
          errorDetails: result.error ? result.error.stack : null,
        },
      });

      logger.info(`Logged scrape result for ${result.brand}`);
    });

    logger.info(`Successfully wrote scrape results for ${result.brand}`);
  } catch (error) {
    logger.error(`Failed to write scrape results for ${result.brand}`, error);
    throw error;
  }
}
