import { Logger } from '../../../shared/utils/logger';
import { FitnessClass, RawClassData, ScrapeResult } from '../../../shared/types';

export abstract class BaseIntegration {
  abstract studioId: string;
  abstract studioName: string;
  abstract brand: string;
  abstract integrationType: 'api' | 'scraper';

  protected _logger?: Logger;

  protected get logger(): Logger {
    if (!this._logger) {
      this._logger = new Logger(this.brand);
    }
    return this._logger;
  }

  /**
   * Main fetch method - to be implemented by each integration
   * Fetches raw class data from the studio's system
   */
  abstract fetch(date: Date): Promise<RawClassData[]>;

  /**
   * Normalize raw data to standard FitnessClass format
   */
  abstract normalize(rawData: RawClassData[]): FitnessClass[];

  /**
   * Run the integration - fetch and normalize
   */
  async run(date: Date = new Date()): Promise<ScrapeResult> {
    const startTime = Date.now();
    this.logger.info(`Starting integration for ${this.brand}`);

    try {
      // Fetch raw data
      const rawData = await this.fetch(date);
      this.logger.info(`Fetched ${rawData.length} raw classes`);

      // Normalize data
      const classes = this.normalize(rawData);
      this.logger.info(`Normalized to ${classes.length} classes`);

      const duration = Date.now() - startTime;
      this.logger.info(`Integration completed in ${duration}ms`);

      return {
        brand: this.brand,
        status: 'success',
        message: `Successfully fetched ${classes.length} classes`,
        classes,
        classCount: classes.length,
      };
    } catch (error) {
      this.logger.error(`Integration failed`, error);
      return {
        brand: this.brand,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        classes: [],
        classCount: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      this.logger.warn(`Retry attempt remaining: ${retries}. Waiting ${delay}ms`);
      await this.sleep(delay);
      return this.retry(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
