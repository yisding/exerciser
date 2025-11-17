import dotenv from 'dotenv';
import { Scheduler } from './scheduler';
import { Logger } from '../../shared/utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Main');

/**
 * Main entry point for the scraper service
 */
async function main() {
  logger.info('🚀 Exerciser Scraper Service Starting...');

  try {
    // Initialize and start the scheduler
    const scheduler = new Scheduler();
    scheduler.start();

    logger.info('✅ Scraper service is running');
    logger.info('Press Ctrl+C to stop');
  } catch (error) {
    logger.error('Failed to start scraper service', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('\n👋 Shutting down gracefully...');
  process.exit(0);
});

main();
