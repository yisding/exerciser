// Simple structured logger utility

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [${this.context}] ${message}`, data || '');
  }

  error(message: string, error?: Error | any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}`, error || '');
  }

  warn(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}`, data || '');
  }

  debug(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] [${this.context}] ${message}`, data || '');
  }
}
