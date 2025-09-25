import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Enums for transformation types
export enum TransformationType {
  GEOMETRIC_PROGRESSION = 'geometric',
  ROTATION = 'rotation',
  REFLECTION = 'reflection', 
  SHADING_PROGRESSION = 'shading',
  ELEMENT_MODIFICATION = 'elements',
  POSITION_SHIFT = 'position'
}

export enum GeometricShape {
  TRIANGLE = '△',
  SQUARE = '■',
  PENTAGON = '⬟',
  HEXAGON = '⬢',
  CIRCLE = '○',
  STAR = '★'
}

export enum ShadingLevel {
  LIGHT = '☐',
  MEDIUM = '🔶',
  DARK = '🟨'
}

export enum ReflectionType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  NONE = 'none'
}

// Interface for individual figure elements in the sequence
export interface FigureElement {
  shape: GeometricShape;
  rotation: number; // degrees 
  reflection: ReflectionType;
  shading: ShadingLevel;
  position: { x: number; y: number };
  elements: number; // count of sub-elements (dots, lines)
}

// Main puzzle interface extending BasePuzzle
export interface SequentialFiguresPuzzle extends BasePuzzle {
  sequence: FigureElement[];
  sequenceLength: number; // 3-5 figures
  transformationType: TransformationType;
}

/**
 * Sequential Figures Puzzle Generator
 * Generates linear sequences of 3-5 figures with transformations for logical reasoning.
 * Based on CogAT-style Serial Reasoning puzzles.
 */
export class SequentialFiguresPuzzleGenerator extends BasePuzzleGenerator<SequentialFiguresPuzzle> {
  
  private determineDifficulty(transformationType: TransformationType, sequenceLength: number): 'easy' | 'medium' | 'hard' {
    // Map transformation types and sequence lengths to difficulty
    if (sequenceLength <= 3) {
      if (transformationType === TransformationType.GEOMETRIC_PROGRESSION || transformationType === TransformationType.SHADING_PROGRESSION) {
        return 'easy';
      }
      return 'medium';
    } else if (sequenceLength === 4) {
      if (transformationType === TransformationType.POSITION_SHIFT || transformationType === TransformationType.ELEMENT_MODIFICATION) {
        return 'hard';
      }
      return 'medium';
    } else {
      return 'hard';
    }
  }

  /**
   * Example sequential figure puzzles that the dynamic generator creates for developer reference:
   * 
   * Geometric Progression (30% easy, 15% medium-hard):
   * [△] → [□] → [⬟] → [?]     Shape sides: 3 → 4 → 5 → 6 (hexagon ⬢)
   * [△] → [□] → [⬟] → [⬢] → [?]  Longer sequence: Answer is ○ (circle)
   * 
   * Rotation Sequences (20% easy-medium, 15% medium-hard):
   * [△ 0°] → [△ 90°] → [△ 180°] → [?]    Answer: △ 270° (▽)
   * [★ 0°] → [★ 60°] → [★ 120°] → [?]    Answer: ★ 180° (harder 60° steps)
   * [★] → [★] → [★] → [★] → [?]           4-step rotation: Answer returns to start
   * 
   * Reflection Patterns (20% medium):
   * [△] → [▽] → [△] → [?]      Alternating horizontal flip: Answer ▽
   * [▷] → [◁] → [▷] → [?]      Vertical reflection pattern: Answer ◁
   * 
   * Shading Progression (20% easy-medium):
   * [○ light] → [◐ medium] → [● dark] → [?]    Cycle: Answer ○ (back to light)
   * [□ empty] → [▣ partial] → [■ full] → [?]   Answer: □ (cycles back)
   * 
   * Element Modification (15% medium):
   * [○•] → [○••] → [○•••] → [?]    Adding dots: Answer ○•••• (4 dots)
   * [□|] → [□||] → [□|||] → [?]    Adding lines: Answer □||||
   * 
   * Position Shifting (rare, 15% hard):
   * [○   ] → [ ○  ] → [  ○ ] → [?]    Moving right: Answer [   ○]
   * Sequential movement with predictable patterns
   * 
   * Difficulty Distribution:
   * - Easy (30%): 3-figure sequences, simple patterns
   * - Easy-Medium (20%): 3-4 figures, clear transformations  
   * - Medium (20%): 4 figures, multiple attributes
   * - Medium-Hard (15%): 4-5 figures, complex rules
   * - Hard (15%): 5 figures, combined transformations
   */

  /**
   * Generate random sequential figures puzzle
   */
  getRandom(): SequentialFiguresPuzzle {
    const numericDifficulty = this.getRandomNumericDifficulty();
    const transformationType = this.getRandomTransformation();
    const sequenceLength = this.getSequenceLengthForNumericDifficulty(numericDifficulty);
    
    switch (transformationType) {
      case TransformationType.GEOMETRIC_PROGRESSION:
        return this.generateGeometricProgression(numericDifficulty, sequenceLength);
      case TransformationType.ROTATION:
        return this.generateRotationSequence(numericDifficulty, sequenceLength);
      case TransformationType.REFLECTION:
        return this.generateReflectionSequence(numericDifficulty, sequenceLength);
      case TransformationType.SHADING_PROGRESSION:
        return this.generateShadingSequence(numericDifficulty, sequenceLength);
      case TransformationType.ELEMENT_MODIFICATION:
        return this.generateElementSequence(numericDifficulty, sequenceLength);
      case TransformationType.POSITION_SHIFT:
        return this.generatePositionSequence(numericDifficulty, sequenceLength);
      default:
        return this.generateGeometricProgression(numericDifficulty, sequenceLength);
    }
  }

  private getRandomNumericDifficulty(): 1 | 2 | 3 | 4 | 5 {
    const rand = Math.random();
    if (rand < 0.3) return 1;      // 30% easy
    if (rand < 0.5) return 2;      // 20% easy-medium
    if (rand < 0.7) return 3;      // 20% medium
    if (rand < 0.85) return 4;     // 15% medium-hard
    return 5;                      // 15% hard
  }

  private getRandomTransformation(): TransformationType {
    const transformations = Object.values(TransformationType);
    return transformations[Math.floor(Math.random() * transformations.length)];
  }

  private getSequenceLengthForNumericDifficulty(difficulty: 1 | 2 | 3 | 4 | 5): number {
    if (difficulty <= 2) return 3;  // Easy: 3 figures
    if (difficulty <= 4) return 4;  // Medium: 4 figures  
    return 5;                       // Hard: 5 figures
  }

  private generateGeometricProgression(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shapes = [GeometricShape.TRIANGLE, GeometricShape.SQUARE, GeometricShape.PENTAGON, GeometricShape.HEXAGON];
    const sequence: FigureElement[] = [];
    
    // Create sequence of increasing-sided shapes
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape: shapes[i % shapes.length],
        rotation: 0,
        reflection: ReflectionType.NONE,
        shading: ShadingLevel.LIGHT,
        position: { x: 0, y: 0 },
        elements: 0
      });
    }

    const nextShape = shapes[sequenceLength % shapes.length];
    const wrongOptions = this.generateWrongOptions(nextShape, TransformationType.GEOMETRIC_PROGRESSION);
    
    const options = [nextShape, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextShape);

    const difficultyLevel = this.determineDifficulty(TransformationType.GEOMETRIC_PROGRESSION, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'geometric', difficultyLevel);

    return {
      question: 'What comes next in the sequence?',
      sequence,
      sequenceLength,
      transformationType: TransformationType.GEOMETRIC_PROGRESSION,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.GEOMETRIC_PROGRESSION, sequence, nextShape),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'geometric',
      difficultyLevel,
      semanticId
    };
  }

  private generateRotationSequence(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shape = GeometricShape.TRIANGLE; // Use triangle for clear rotation visibility
    const rotationStep = difficulty <= 2 ? 90 : 60; // Easier: 90°, Harder: 60°
    const sequence: FigureElement[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape,
        rotation: (i * rotationStep) % 360,
        reflection: ReflectionType.NONE,
        shading: ShadingLevel.LIGHT,
        position: { x: 0, y: 0 },
        elements: 0
      });
    }

    const nextRotation = (sequenceLength * rotationStep) % 360;
    const nextFigure = this.rotationToSymbol(nextRotation);
    const wrongOptions = this.generateWrongOptions(nextFigure, TransformationType.ROTATION);
    
    const options = [nextFigure, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextFigure);

    const difficultyLevel = this.determineDifficulty(TransformationType.ROTATION, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'rotation', difficultyLevel);

    return {
      question: 'Find the next figure in the rotation sequence.',
      sequence,
      sequenceLength,
      transformationType: TransformationType.ROTATION,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.ROTATION, sequence, nextFigure),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'rotation',
      difficultyLevel,
      semanticId
    };
  }

  private generateReflectionSequence(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shape = GeometricShape.TRIANGLE;
    const sequence: FigureElement[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape,
        rotation: 0,
        reflection: i % 2 === 0 ? ReflectionType.NONE : ReflectionType.HORIZONTAL,
        shading: ShadingLevel.LIGHT,
        position: { x: 0, y: 0 },
        elements: 0
      });
    }

    const nextReflection = sequenceLength % 2 === 0 ? ReflectionType.NONE : ReflectionType.HORIZONTAL;
    const nextFigure = nextReflection === ReflectionType.NONE ? '△' : '▽';
    const wrongOptions = this.generateWrongOptions(nextFigure, TransformationType.REFLECTION);
    
    const options = [nextFigure, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextFigure);

    const difficultyLevel = this.determineDifficulty(TransformationType.REFLECTION, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'reflection', difficultyLevel);

    return {
      question: 'Find the next figure in the reflection pattern.',
      sequence,
      sequenceLength,
      transformationType: TransformationType.REFLECTION,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.REFLECTION, sequence, nextFigure),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'reflection',
      difficultyLevel,
      semanticId
    };
  }

  private generateShadingSequence(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shape = GeometricShape.CIRCLE;
    const shadings = [ShadingLevel.LIGHT, ShadingLevel.MEDIUM, ShadingLevel.DARK];
    const sequence: FigureElement[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape,
        rotation: 0,
        reflection: ReflectionType.NONE,
        shading: shadings[i % shadings.length],
        position: { x: 0, y: 0 },
        elements: 0
      });
    }

    const nextShading = shadings[sequenceLength % shadings.length];
    const nextFigure = this.shadingToSymbol(nextShading);
    const wrongOptions = this.generateWrongOptions(nextFigure, TransformationType.SHADING_PROGRESSION);
    
    const options = [nextFigure, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextFigure);

    const difficultyLevel = this.determineDifficulty(TransformationType.SHADING_PROGRESSION, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'shading', difficultyLevel);

    return {
      question: 'What shape completes the shading sequence?',
      sequence,
      sequenceLength,
      transformationType: TransformationType.SHADING_PROGRESSION,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.SHADING_PROGRESSION, sequence, nextFigure),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'shading',
      difficultyLevel,
      semanticId
    };
  }

  private generateElementSequence(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shape = GeometricShape.CIRCLE;
    const sequence: FigureElement[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape,
        rotation: 0,
        reflection: ReflectionType.NONE,
        shading: ShadingLevel.LIGHT,
        position: { x: 0, y: 0 },
        elements: i + 1 // 1, 2, 3, 4, 5...
      });
    }

    const nextElementCount = sequenceLength + 1;
    const nextFigure = this.elementsToSymbol(nextElementCount);
    const wrongOptions = this.generateWrongOptions(nextFigure, TransformationType.ELEMENT_MODIFICATION);
    
    const options = [nextFigure, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextFigure);

    const difficultyLevel = this.determineDifficulty(TransformationType.ELEMENT_MODIFICATION, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'elements', difficultyLevel);

    return {
      question: 'Complete the element addition sequence.',
      sequence,
      sequenceLength,
      transformationType: TransformationType.ELEMENT_MODIFICATION,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.ELEMENT_MODIFICATION, sequence, nextFigure),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'elements',
      difficultyLevel,
      semanticId
    };
  }

  private generatePositionSequence(difficulty: number, sequenceLength: number): SequentialFiguresPuzzle {
    const shape = GeometricShape.CIRCLE;
    const sequence: FigureElement[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        shape,
        rotation: 0,
        reflection: ReflectionType.NONE,
        shading: ShadingLevel.LIGHT,
        position: { x: i, y: 0 }, // Moving horizontally
        elements: 0
      });
    }

    const nextPosition = sequenceLength;
    const nextFigure = this.positionToSymbol(nextPosition);
    const wrongOptions = this.generateWrongOptions(nextFigure, TransformationType.POSITION_SHIFT);
    
    const options = [nextFigure, ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(nextFigure);

    const difficultyLevel = this.determineDifficulty(TransformationType.POSITION_SHIFT, sequenceLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('sequential-figures', 'position', difficultyLevel);

    return {
      question: 'Where does the circle move next?',
      sequence,
      sequenceLength,
      transformationType: TransformationType.POSITION_SHIFT,
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(TransformationType.POSITION_SHIFT, sequence, nextFigure),
      puzzleType: 'sequential-figures',
      puzzleSubtype: 'position',
      difficultyLevel,
      semanticId
    };
  }

  // Helper methods for symbol conversion
  private rotationToSymbol(rotation: number): string {
    switch (rotation) {
      case 0: return '△';
      case 90: return '▷';
      case 180: return '▽';
      case 270: return '◁';
      default: return '△';
    }
  }

  private shadingToSymbol(shading: ShadingLevel): string {
    switch (shading) {
      case ShadingLevel.LIGHT: return '○';
      case ShadingLevel.MEDIUM: return '🔆';
      case ShadingLevel.DARK: return '🌟';
      default: return '○';
    }
  }

  private elementsToSymbol(count: number): string {
    const dots = '•'.repeat(Math.min(count, 4));
    return `○${dots}`;
  }

  private positionToSymbol(position: number): string {
    // Simple representation of horizontal position
    const spaces = ' '.repeat(position);
    return `${spaces}○`;
  }

  private generateWrongOptions(correctAnswer: string, transformationType: TransformationType): string[] {
    const wrongOptions: string[] = [];
    
    switch (transformationType) {
      case TransformationType.GEOMETRIC_PROGRESSION:
        // Fun and engaging geometric shapes
        const shapes = ['🌟', '⭐', '🔥', '💎', '🎯', '🎪', '🎭', '🚀', '⚡', '🌈', '🎨', '🎮'];
        const candidates = shapes.filter(s => s !== correctAnswer);
        wrongOptions.push(...candidates.slice(0, 3));
        break;
        
      case TransformationType.ROTATION:
        // Vibrant and colorful rotational shapes
        const rotations = ['🔄', '🌈', '🎡', '🎯', '🌪️', '⚡', '🌀', '💫', '🎭', '🎨', '🎪', '🎊'];
        wrongOptions.push(...rotations.filter(r => r !== correctAnswer).slice(0, 3));
        break;
        
      case TransformationType.REFLECTION:
        // Fun reflection shapes
        wrongOptions.push('🪞', '🔄', '💎', '⭐', '🌟', '✨');
        break;
        
      case TransformationType.SHADING_PROGRESSION:
        wrongOptions.push('○', '◐', '●', '◑');
        break;
        
      case TransformationType.ELEMENT_MODIFICATION:
        wrongOptions.push('○•', '○••', '○•••');
        break;
        
      case TransformationType.POSITION_SHIFT:
        wrongOptions.push('○', ' ○', '  ○');
        break;
    }
    
    // Ensure exactly 3 wrong options
    while (wrongOptions.length < 3) {
      wrongOptions.push('?');
    }
    
    return wrongOptions.filter(opt => opt !== correctAnswer).slice(0, 3);
  }

  private generateExplanation(type: TransformationType, sequence: FigureElement[], nextFigure: string): string {
    switch (type) {
      case TransformationType.GEOMETRIC_PROGRESSION:
        return 'The sequence shows geometric progression with increasing number of sides: triangle → square → pentagon → hexagon.';
      case TransformationType.ROTATION:
        return 'The shape rotates systematically in each step. Follow the rotation pattern to find the next position.';
      case TransformationType.REFLECTION:
        return 'The shape alternates between normal and reflected orientations. The pattern continues with the next flip.';
      case TransformationType.SHADING_PROGRESSION:
        return 'The shading progresses through light, medium, and dark levels, then cycles back to the beginning.';
      case TransformationType.ELEMENT_MODIFICATION:
        return 'Each figure gains one additional element (dot, line, or shape) in sequence.';
      case TransformationType.POSITION_SHIFT:
        return 'The shape moves along a defined path, shifting position systematically in each step.';
      default:
        return 'Follow the pattern to determine what comes next in the sequence.';
    }
  }

  private shuffleArray(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// Export singleton instance
export const sequentialFiguresPuzzleGenerator = new SequentialFiguresPuzzleGenerator();