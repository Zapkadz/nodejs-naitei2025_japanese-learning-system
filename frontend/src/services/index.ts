
import type { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';
import { ApiDataService } from './ApiDataService';
import { USE_MOCK_DATA, API_BASE_URL } from './config';

/**
 * Singleton data service instance
 * Automatically selects between Mock and API implementation based on USE_MOCK_DATA flag
 */
let dataServiceInstance: IDataService | null = null;

/**
 * Get the data service instance
 * Creates a singleton on first call
 */
export function getDataService(): IDataService {
  if (!dataServiceInstance) {
    if (USE_MOCK_DATA) {
      if (import.meta.env.DEV) {
        console.info('🔧 Using Mock Data Service'); 
      }
      dataServiceInstance = new MockDataService();
    } else {
      // Development logging only
      if (import.meta.env.DEV) {
        console.info(' Using API Data Service:', API_BASE_URL); 
      }
      dataServiceInstance = new ApiDataService(API_BASE_URL);
    }
  }

  return dataServiceInstance;
}

/**
 * Reset the data service instance (useful for testing)
 */
export function resetDataService(): void {
  dataServiceInstance = null;
}

/**
 * Default export - singleton data service
 */
export const dataService = getDataService();

// Re-export types and interfaces for convenience
export type { IDataService } from './IDataService';
export * from '../types';
