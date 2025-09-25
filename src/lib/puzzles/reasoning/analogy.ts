import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator, ExplanationGenerator } from '@/src/lib/game/basePuzzle';

export interface AnalogyPuzzle extends BasePuzzle {
  // Analogy puzzles don't have grids, only text-based relationships
  relationshipType: string;
}

/**
 * Analogy Puzzle Generator
 * Generates A:B as C:? relationship puzzles for logical reasoning.
 */
export class AnalogyPuzzleGenerator extends BasePuzzleGenerator<AnalogyPuzzle> {
  
  private determineDifficulty(relationshipType: string): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'opposite': 'easy',
      'category': 'easy',
      'function': 'medium',
      'part-whole': 'medium',
      'cause-effect': 'hard',
      'sequence': 'hard',
      'transformation': 'hard'
    };
    return difficultyMap[relationshipType] || 'medium';
  }
  
  /**
   * Example analogies that the dynamic generator creates for developer reference:
   * 
   * Opposite Relationships:
   * Big is to Small as Tall is to [Short]
   * Hot is to Cold as Up is to [Down]
   * 
   * Category/Habitat Relationships:
   * Fish is to Water as Bird is to [Air]
   * Cat is to Kitten as Dog is to [Puppy]
   * 
   * Function/Tool Relationships:
   * Hammer is to Nail as Screwdriver is to [Screw]
   * Pencil is to Write as Brush is to [Paint]
   * Key is to Lock as Password is to [Computer]
   * 
   * Part-Whole Relationships:
   * Engine is to Car as Heart is to [Body]
   * Wheel is to Car as Wing is to [Bird]
   * Book is to Library as Painting is to [Museum]
   * 
   * Cause-Effect Relationships:
   * Fire is to Smoke as Sun is to [Light]
   * Rain is to Flood as Earthquake is to [Damage]
   * 
   * Sequence/Transformation Relationships:
   * January is to December as First is to [Last]
   * Ice is to Water as Caterpillar is to [Butterfly]
   * Spring is to Summer as Childhood is to [Adulthood]
   * 
   * Professional Relationships:
   * Teacher is to Student as Doctor is to [Patient]
   */
  
  /**
   * Dynamically generate a random analogy puzzle
   */
  getRandom(): AnalogyPuzzle {
    const templates = this.getAnalogyTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const difficultyLevel = this.determineDifficulty(template.relationshipType);
    const semanticId = SemanticIdGenerator.generateSemanticId('analogy', template.relationshipType, difficultyLevel);
    
    return {
      question: template.question,
      options: template.options,
      correctAnswerIndex: template.correctAnswerIndex,
      explanation: ExplanationGenerator.generateAnalogyExplanation(template.relationshipType, template.details),
      relationshipType: template.relationshipType,
      puzzleType: 'analogy',
      puzzleSubtype: template.relationshipType,
      difficultyLevel,
      semanticId
    };
  }
  
  private getAnalogyTemplates() {
    return [
      {
        question: 'Big is to Small as Tall is to ?',
        options: ['Short', 'High', 'Long', 'Wide'],
        correctAnswerIndex: 0,
        relationshipType: 'opposite',
        details: {}
      },
      {
        question: 'Fish is to Water as Bird is to ?',
        options: ['Air', 'Tree', 'Nest', 'Wing'],
        correctAnswerIndex: 0,
        relationshipType: 'category',
        details: { detail: 'natural habitat' }
      },
      {
        question: 'Hammer is to Nail as Screwdriver is to ?',
        options: ['Screw', 'Tool', 'Build', 'Fix'],
        correctAnswerIndex: 0,
        relationshipType: 'function',
        details: { detail: 'tool to fastener relationship' }
      },
      {
        question: 'Engine is to Car as Heart is to ?',
        options: ['Body', 'Blood', 'Life', 'Beat'],
        correctAnswerIndex: 0,
        relationshipType: 'part-whole',
        details: { detail: 'essential organ/component' }
      },
      {
        question: 'Fire is to Smoke as Sun is to ?',
        options: ['Light', 'Heat', 'Day', 'Sky'],
        correctAnswerIndex: 0,
        relationshipType: 'cause-effect',
        details: { detail: 'natural source to output' }
      },
      {
        question: 'January is to December as First is to ?',
        options: ['Last', 'Second', 'End', 'Final'],
        correctAnswerIndex: 0,
        relationshipType: 'sequence',
        details: { detail: 'beginning to end sequence' }
      },
      {
        question: 'Pencil is to Write as Brush is to ?',
        options: ['Paint', 'Art', 'Color', 'Canvas'],
        correctAnswerIndex: 0,
        relationshipType: 'function',
        details: { detail: 'tool to primary function' }
      },
      {
        question: 'Ice is to Water as Caterpillar is to ?',
        options: ['Butterfly', 'Insect', 'Leaf', 'Cocoon'],
        correctAnswerIndex: 0,
        relationshipType: 'transformation',
        details: { transformation: 'natural state change' }
      }
    ];
  }
}

// Export singleton instance and legacy functions for backward compatibility
export const analogyPuzzleGenerator = new AnalogyPuzzleGenerator();


/**
 * @deprecated Use analogyPuzzleGenerator.getRandom() instead  
 */
export function generateRandomAnalogyPuzzle(): AnalogyPuzzle & { type: string; correctAnswer: string } {
  const puzzle = analogyPuzzleGenerator.getRandom();
  return {
    ...puzzle,
    type: 'analogy',
    correctAnswer: puzzle.options[puzzle.correctAnswerIndex]
  };
}

export default analogyPuzzleGenerator;