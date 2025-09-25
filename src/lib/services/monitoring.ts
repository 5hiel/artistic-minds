/**
 * Simple Monitoring Service
 * 
 * Lightweight error tracking for critical issues only.
 * App Store Connect automatically provides:
 * - Crash reports and stack traces
 * - Session analytics and user engagement
 * - App launch metrics and performance data
 * - Device and OS version breakdowns
 * - User retention and conversion metrics
 */

// React hook for simple error tracking in development
import { useEffect } from 'react';

class MonitoringService {
  // Simple error logging for development debugging
  public trackError(error: Error | string, context: Record<string, any> = {}): void {
    if (__DEV__) {
      console.warn('App Error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
      });
    }
    
    // In production, critical errors automatically reported to App Store Connect
    // No additional code needed - iOS/Android handle this natively
  }

  // Development-only performance logging
  public trackGamePerformance(metrics: {
    puzzleGenerationTime?: number;
    renderTime?: number;
    puzzleType?: string;
    difficulty?: number;
  }): void {
    if (__DEV__) {
      console.log('Game Performance:', metrics);
    }
    // App Store Connect automatically tracks app performance metrics
  }

  // Development-only event logging
  public trackGameEvent(event: string, properties: Record<string, any> = {}): void {
    if (__DEV__) {
      console.log('Game Event:', event, properties);
    }
    // User behavior analytics automatically available in App Store Connect
  }

  // Legacy methods kept for compatibility (no-ops in production)
  public trackPerformance(): void { /* No-op - App Store Connect handles this */ }
  public trackEvent(): void { /* No-op - App Store Connect handles this */ }
  public trackFeatureUsage(): void { /* No-op - App Store Connect handles this */ }
  public trackReleaseHealth(): void { /* No-op - App Store Connect handles this */ }
}

// Singleton instance
export const monitoring = new MonitoringService();

export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    if (__DEV__) {
      console.log(`Component mounted: ${componentName}`);
      
      return () => {
        console.log(`Component unmounted: ${componentName}`);
      };
    }
  }, [componentName]);
}

// Hook for game performance monitoring (development only)
export function useGamePerformanceMonitoring() {
  const trackPuzzleGeneration = (puzzleType: string, duration: number) => {
    monitoring.trackGamePerformance({
      puzzleGenerationTime: duration,
      puzzleType,
    });
  };

  const trackGameEvent = (event: string, properties?: Record<string, any>) => {
    monitoring.trackGameEvent(event, properties);
  };

  const trackError = (error: Error | string, context?: Record<string, any>) => {
    monitoring.trackError(error, context);
  };

  return {
    trackPuzzleGeneration,
    trackGameEvent,
    trackError,
  };
}