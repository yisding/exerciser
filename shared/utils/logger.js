"use strict";
// Simple structured logger utility
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(context) {
        this.context = context;
    }
    info(message, data) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] [${this.context}] ${message}`, data || '');
    }
    error(message, error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}`, error || '');
    }
    warn(message, data) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}`, data || '');
    }
    debug(message, data) {
        const timestamp = new Date().toISOString();
        console.debug(`[${timestamp}] [DEBUG] [${this.context}] ${message}`, data || '');
    }
}
exports.Logger = Logger;
