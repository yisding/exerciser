import cron from 'node-cron';
import { Orchestrator } from './integrations/orchestrator';
import { Logger } from '../../shared/utils/logger';

const logger = new Logger('Scheduler');

/**
 * Scheduler for running integrations periodically
 */
export class Scheduler {
  private orchestrator: Orchestrator;

  constructor() {
    this.orchestrator = new Orchestrator();
  }

  /**
   * Start the scheduler
   * Runs all integrations every 30 minutes
   */
  start(): void {
    logger.info('Starting scheduler...');

    // Run immediately on startup
    logger.info('Running initial scrape...');
    this.runAll();

    // Schedule to run every 30 minutes
    // Cron format: minute hour day month weekday
    // '*/30 * * * *' = every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      logger.info('Scheduled scrape triggered');
      this.runAll();
    });

    logger.info('Scheduler started - running every 30 minutes');
  }

  /**
   * Run all integrations
   */
  private async runAll(): Promise<void> {
    try {
      await this.orchestrator.runAll();
      logger.info('Scrape cycle completed successfully');
    } catch (error) {
      logger.error('Scrape cycle failed', error);
    }
  }
}
