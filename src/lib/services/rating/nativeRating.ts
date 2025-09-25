import { Platform } from 'react-native';

/**
 * Platform detection utilities for rating functionality
 */
export const isNativeRatingAvailable = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

export const isWebPlatform = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Native rating service that wraps expo-store-review
 * Provides platform-specific App Store rating functionality
 */
export class NativeRating {
  /**
   * Shows native App Store rating prompt (iOS/Android only)
   * @returns Promise<boolean> - true if rating prompt was shown, false otherwise
   */
  static async requestReview(): Promise<boolean> {
    try {
      if (!isNativeRatingAvailable()) {
        console.log('Native rating not available on this platform');
        return false;
      }

      // Dynamically import expo-store-review to avoid import issues on web
      const StoreReview = await import('expo-store-review');
      
      // Check if native rating is available on the device
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.log('Store review not available on this device');
        return false;
      }

      // Request the native rating prompt
      await StoreReview.requestReview();
      return true;
    } catch (error) {
      console.warn('Failed to show native rating prompt:', error);
      return false;
    }
  }

  /**
   * Checks if native rating is available on the current platform/device
   * @returns Promise<boolean> - true if available, false otherwise
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (!isNativeRatingAvailable()) {
        return false;
      }

      // Dynamically import expo-store-review
      const StoreReview = await import('expo-store-review');
      return await StoreReview.isAvailableAsync();
    } catch (error) {
      console.warn('Failed to check rating availability:', error);
      return false;
    }
  }

  /**
   * Checks if the device has a rating mechanism available
   * Used for iOS/Android to determine if we should show rating prompts
   * @returns Promise<boolean>
   */
  static async hasStoreReview(): Promise<boolean> {
    try {
      if (!isNativeRatingAvailable()) {
        return false;
      }

      const StoreReview = await import('expo-store-review');
      return await StoreReview.hasAction();
    } catch (error) {
      console.warn('Failed to check store review action:', error);
      return false;
    }
  }

  /**
   * Opens the App Store page for manual rating (fallback for web or failed native prompts)
   * @param appId - The app store ID (iOS) or package name (Android)
   */
  static async openStoreForRating(appId?: string): Promise<void> {
    try {
      let storeUrl: string;

      if (Platform.OS === 'ios') {
        // iOS App Store URL
        const iosAppId = appId || 'YOUR_IOS_APP_ID'; // Replace with actual App Store ID
        storeUrl = `https://apps.apple.com/app/id${iosAppId}?action=write-review`;
      } else if (Platform.OS === 'android') {
        // Google Play Store URL
        const androidPackage = appId || 'com.shiel.giftedminds';
        storeUrl = `https://play.google.com/store/apps/details?id=${androidPackage}&showAllReviews=true`;
      } else {
        // Web fallback - could open both stores or show selection
        storeUrl = 'https://apps.apple.com/app/gifted-minds/'; // Default fallback
      }

      // Dynamic import to avoid issues with Linking on web
      if (Platform.OS !== 'web') {
        const { Linking } = await import('react-native');
        const canOpen = await Linking.canOpenURL(storeUrl);
        if (canOpen) {
          await Linking.openURL(storeUrl);
        }
      } else {
        // Web platform - open in new tab
        window.open(storeUrl, '_blank');
      }
    } catch (error) {
      console.warn('Failed to open store for rating:', error);
    }
  }
}

/**
 * App Store URLs configuration
 */
export const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/gifted-minds/', // Replace with actual App Store URL
  android: 'https://play.google.com/store/apps/details?id=com.shiel.giftedminds',
  web: {
    ios: 'https://apps.apple.com/app/gifted-minds/',
    android: 'https://play.google.com/store/apps/details?id=com.shiel.giftedminds',
  }
};