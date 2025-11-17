import { ClubPilatesIntegration } from './club-pilates.integration';
import { CycleBarIntegration } from './cyclebar.integration';
import { writeScrapeResults } from '../db/writer';
import { Logger } from '../../../shared/utils/logger';
import { BaseIntegration } from './base.integration';

const logger = new Logger('Orchestrator');

/**
 * Integration Orchestrator
 * Manages running multiple studio integrations
 */
export class Orchestrator {
  private integrations: BaseIntegration[] = [];

  constructor() {
    // Register all available integrations
    this.integrations = [
      new ClubPilatesIntegration(),
      new CycleBarIntegration(),
      // Add more integrations here as they're implemented
    ];
  }

  /**
   * Run all integrations sequentially
   */
  async runAll(): Promise<void> {
    logger.info(`Starting orchestrator with ${this.integrations.length} integrations`);

    const results = {
      total: this.integrations.length,
      success: 0,
      failed: 0,
      totalClasses: 0,
    };

    for (const integration of this.integrations) {
      try {
        logger.info(`Running ${integration.brand} integration...`);

        const result = await integration.run();

        if (result.status === 'success') {
          await writeScrapeResults(result);
          results.success++;
          results.totalClasses += result.classCount;
          logger.info(`✅ ${integration.brand}: ${result.classCount} classes`);
        } else {
          results.failed++;
          logger.error(`❌ ${integration.brand} failed:`, result.error);
        }

        // Small delay between integrations to be polite
        await this.sleep(1000);
      } catch (error) {
        results.failed++;
        logger.error(`❌ ${integration.brand} threw exception:`, error);
      }
    }

    logger.info('Orchestrator complete', results);
  }

  /**
   * Run a specific integration by brand name
   */
  async runOne(brandName: string): Promise<void> {
    const integration = this.integrations.find(
      (i) => i.brand.toLowerCase() === brandName.toLowerCase()
    );

    if (!integration) {
      throw new Error(`Integration not found for brand: ${brandName}`);
    }

    logger.info(`Running ${integration.brand} integration...`);

    const result = await integration.run();

    if (result.status === 'success') {
      await writeScrapeResults(result);
      logger.info(`✅ ${integration.brand}: ${result.classCount} classes`);
    } else {
      logger.error(`❌ ${integration.brand} failed:`, result.error);
      throw result.error || new Error(result.message);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
