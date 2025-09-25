/**
 * Simplified Adaptive Storage Adapter
 * Provides a unified interface to the simplified behavioral signature storage
 */

import { Platform } from 'react-native';
import { BehavioralSignatureStorage } from './behavioralSignatureStorage';

export type AdaptiveStorageInstance = BehavioralSignatureStorage;

/**
 * Get the storage implementation
 */
export async function getAdaptiveStorage(): Promise<AdaptiveStorageInstance> {
  try {
    console.log('🔄 [AdaptiveStorageAdapter] Initializing storage...');
    console.log(`📱 Platform: ${Platform.OS}`);

    const storage = BehavioralSignatureStorage.getInstance();

    // Test if it works
    await storage.getUserProfile();

    console.log('✅ [AdaptiveStorageAdapter] Storage initialized successfully');
    return storage;
  } catch (error) {
    console.error('❌ [AdaptiveStorageAdapter] Failed to initialize storage:', error);
    // Return the instance anyway - it will create defaults
    return BehavioralSignatureStorage.getInstance();
  }
}

/**
 * Singleton storage instance
 */
let storageInstance: AdaptiveStorageInstance | null = null;

/**
 * Get cached storage instance
 */
export async function getStorageInstance(): Promise<AdaptiveStorageInstance> {
  if (!storageInstance) {
    storageInstance = await getAdaptiveStorage();
  }
  return storageInstance;
}

/**
 * Reset storage instance (for testing)
 */
export function resetStorageInstance(): void {
  storageInstance = null;
  console.log('🔄 [AdaptiveStorageAdapter] Storage instance reset');
}

/**
 * Get storage type information
 */
export async function getStorageInfo(): Promise<{
  type: 'simplified';
  platform: string;
  isWorking: boolean;
}> {
  try {
    await getStorageInstance();
    return {
      type: 'simplified',
      platform: Platform.OS,
      isWorking: true
    };
  } catch {
    return {
      type: 'simplified',
      platform: Platform.OS,
      isWorking: false
    };
  }
}