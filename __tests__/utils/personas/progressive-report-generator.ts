/**
 * Progressive Report Generator
 * Stub implementation for persona testing
 */

export interface ProgressReport {
  sessionId: string;
  progress: number;
  insights: string[];
}

export class ProgressiveReportGenerator {
  generateReport(sessionData?: any): ProgressReport {
    return {
      sessionId: 'test-session',
      progress: 0.5,
      insights: ['Test insight']
    };
  }

  generateProgressiveReport(...args: any[]): ProgressReport {
    return this.generateReport(args[0]);
  }

  generateFinalReport(...args: any[]): ProgressReport {
    return this.generateReport(args[0]);
  }

  generateChunkReport(...args: any[]): ProgressReport {
    return this.generateReport(args[0]);
  }
}