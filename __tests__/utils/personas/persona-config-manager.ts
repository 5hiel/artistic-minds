/**
 * Persona Config Manager
 * Stub implementation for persona testing
 */

export interface PersonaConfig {
  name: string;
  age: number;
  skills: string[];
  preferences: Record<string, any>;
}

export class PersonaConfigManager {

  getConfig(): PersonaConfig {
    return {
      name: 'Test Persona',
      age: 25,
      skills: [],
      preferences: {}
    };
  }

  updateConfig(updates: Partial<PersonaConfig>): void {
    // Stub implementation
  }

  getPersonaConfig(persona?: string): PersonaConfig | null {
    return this.getConfig();
  }

  getAvailablePersonas(): string[] {
    return ['test-persona'];
  }
}