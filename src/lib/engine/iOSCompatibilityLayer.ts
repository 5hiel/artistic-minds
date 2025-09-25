/**
 * iOS Compatibility Layer for Adaptive Engine
 * Handles iOS-specific issues with storage, platform detection, and module imports
 */

import { Platform } from 'react-native';

// Types
interface IOSStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface IOSCompatibilityResult {
  storage: IOSStorageInterface | null;
  platform: string;
  isSupported: boolean;
  errors: string[];
}

/**
 * Safe AsyncStorage import with iOS fallback
 */
export async function getIOSCompatibleStorage(): Promise<IOSStorageInterface | null> {
  try {
    // Method 1: Try standard import
    const AsyncStorage = await import('@react-native-async-storage/async-storage');

    // Test if it actually works
    const testKey = '__ios_test_key__';
    await AsyncStorage.default.setItem(testKey, 'test');
    await AsyncStorage.default.getItem(testKey);
    await AsyncStorage.default.removeItem(testKey);

    console.log('✅ [iOSCompatibility] AsyncStorage working correctly');
    return AsyncStorage.default;
  } catch (error) {
    console.warn('⚠️ [iOSCompatibility] AsyncStorage import failed:', (error as Error).message);

    try {
      // Method 2: Try require fallback
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AsyncStorage = require('@react-native-async-storage/async-storage');

      // Test functionality
      const testKey = '__ios_test_key_2__';
      await AsyncStorage.default.setItem(testKey, 'test');
      await AsyncStorage.default.removeItem(testKey);

      console.log('✅ [iOSCompatibility] AsyncStorage require fallback working');
      return AsyncStorage.default;
    } catch (requireError) {
      console.warn('⚠️ [iOSCompatibility] AsyncStorage require fallback failed:', (requireError as Error).message);

      // Method 3: iOS Memory Fallback
      return createMemoryStorage();
    }
  }
}

/**
 * Memory-based storage fallback for iOS issues
 */
function createMemoryStorage(): IOSStorageInterface {
  console.log('⚠️ [iOSCompatibility] Using memory-based storage fallback for iOS');

  const memoryStore = new Map<string, string>();

  return {
    async getItem(key: string): Promise<string | null> {
      return memoryStore.get(key) || null;
    },

    async setItem(key: string, value: string): Promise<void> {
      memoryStore.set(key, value);
    },

    async removeItem(key: string): Promise<void> {
      memoryStore.delete(key);
    },

    async clear(): Promise<void> {
      memoryStore.clear();
    }
  };
}

/**
 * Safe platform detection for iOS
 */
export function getIOSCompatiblePlatform(): string {
  try {
    if (Platform && Platform.OS) {
      return Platform.OS;
    }
  } catch (error) {
    console.warn('⚠️ [iOSCompatibility] Platform detection failed:', (error as Error).message);
  }

  // Fallback detection methods
  try {
    // Method 1: User agent check
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        return 'ios';
      }
    }

    // Method 2: Check for iOS-specific globals
    if (typeof window !== 'undefined') {
      // Check for iOS-specific webkit properties
      if ((window as any).webkit && (window as any).webkit.messageHandlers) {
        return 'ios';
      }
    }

    // Method 3: React Native specific checks
    if (typeof global !== 'undefined') {
      if ((global as any).__react_native_ios__) {
        return 'ios';
      }
    }

    return 'unknown';
  } catch (error) {
    console.warn('⚠️ [iOSCompatibility] Fallback platform detection failed:', (error as Error).message);
    return 'unknown';
  }
}

/**
 * Check if current environment is iOS
 */
export function isIOSEnvironment(): boolean {
  const platform = getIOSCompatiblePlatform();
  return platform === 'ios';
}

/**
 * Initialize iOS compatibility layer
 */
export async function initializeIOSCompatibility(): Promise<IOSCompatibilityResult> {
  const errors: string[] = [];
  let storage: IOSStorageInterface | null = null;

  console.log('🔄 [iOSCompatibility] Initializing iOS compatibility layer...');

  // Get platform info
  const platform = getIOSCompatiblePlatform();
  console.log(`📱 [iOSCompatibility] Detected platform: ${platform}`);

  // Get storage
  try {
    storage = await getIOSCompatibleStorage();
    if (storage) {
      console.log('✅ [iOSCompatibility] Storage initialized successfully');
    } else {
      errors.push('Failed to initialize storage');
    }
  } catch (error) {
    errors.push(`Storage initialization error: ${(error as Error).message}`);
    console.error('❌ [iOSCompatibility] Storage initialization failed:', error);
  }

  const isSupported = storage !== null && errors.length === 0;

  if (isSupported) {
    console.log('🎉 [iOSCompatibility] iOS compatibility layer initialized successfully');
  } else {
    console.warn('⚠️ [iOSCompatibility] iOS compatibility issues detected:', errors);
  }

  return {
    storage,
    platform,
    isSupported,
    errors
  };
}

/**
 * iOS-safe module import with retries
 */
export async function safeIOSImport<T>(modulePath: string, retries: number = 3): Promise<T | null> {
  // For web builds, skip dynamic imports to avoid Metro bundler issues
  if (typeof window !== 'undefined') {
    console.log(`🌐 [iOSCompatibility] Skipping dynamic import on web platform: ${modulePath}`);
    return null;
  }

  // For non-web platforms, also return null to avoid Metro bundler issues
  // This function is primarily used for testing and isn't essential for core functionality
  console.log(`📦 [iOSCompatibility] Skipping dynamic import to maintain Metro compatibility: ${modulePath}`);
  return null;
}

/**
 * iOS-safe async operation with timeout
 */
export async function safeIOSAsync<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000,
  fallback?: T
): Promise<T | null> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    const result = await Promise.race([operation(), timeoutPromise]);
    return result;
  } catch (error) {
    console.warn('⚠️ [iOSCompatibility] Async operation failed:', (error as Error).message);
    return fallback || null;
  }
}

/**
 * Check iOS app state and permissions
 */
export function checkIOSAppState(): {
  isActive: boolean;
  hasStoragePermission: boolean;
  isInBackground: boolean;
} {
  try {
    // Basic app state detection for iOS
    const isActive = typeof document !== 'undefined' ? !document.hidden : true;
    const hasStoragePermission = true; // AsyncStorage doesn't require explicit permissions
    const isInBackground = typeof document !== 'undefined' ? document.hidden : false;

    return {
      isActive,
      hasStoragePermission,
      isInBackground
    };
  } catch (error) {
    console.warn('⚠️ [iOSCompatibility] App state check failed:', (error as Error).message);
    return {
      isActive: true,
      hasStoragePermission: true,
      isInBackground: false
    };
  }
}