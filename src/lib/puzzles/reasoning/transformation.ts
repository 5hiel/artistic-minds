import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Enhanced enums for transformation puzzles
export enum TransformationShape {
  CIRCLE = '○',
  SQUARE = '□', 
  TRIANGLE = '△',
  DIAMOND = '◇',
  STAR = '☆'
}

export enum TransformationSize {
  SMALL = 'small',
  MEDIUM = 'medium', 
  LARGE = 'large'
}

export enum TransformationColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange'
}

export enum TransformationFill {
  EMPTY = 'empty',
  QUARTER = 'quarter', 
  HALF = 'half',
  FULL = 'full'
}

export enum TransformationRotation {
  DEGREES_0 = 0,
  DEGREES_90 = 90,
  DEGREES_180 = 180,
  DEGREES_270 = 270
}

export enum TransformationType {
  ROTATION = 'rotation',
  REFLECTION = 'reflection',
  SIZE_CHANGE = 'size',
  COLOR_CHANGE = 'color',
  FILL_CHANGE = 'fill',
  SHAPE_SUBSTITUTION = 'substitution'
}

export enum TransformationDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

// Shape element interface
export interface ShapeElement {
  shape: TransformationShape;
  size: TransformationSize;
  color: TransformationColor;
  fill: TransformationFill;
  rotation: TransformationRotation;
}

// Transformation puzzle interface
export interface TransformationPuzzle extends BasePuzzle {
  grid: (ShapeElement | null)[][];
  missingPosition: { row: number; col: number };
  transformationType: TransformationType;
  transformationDirection: TransformationDirection;
  rule: string;
}

/**
 * Non-Verbal Transformation Puzzle Generator
 * Generates 3x3 grid puzzles with systematic shape transformations.
 */
export class TransformationPuzzleGenerator extends BasePuzzleGenerator<TransformationPuzzle> {
  
  /**
   * Example transformation puzzles that the dynamic generator creates for developer reference:
   * 
   * Horizontal Rotation Patterns:
   * [○ 0°] [○ 90°] [○ 180°]    Each row: same shape rotating 90° clockwise
   * [□ 0°] [□ 90°] [□ 180°]    Colors differ by row (red → blue → green)
   * [△ 0°] [△ 90°] [?]        Answer: △ 180° (green triangle rotated 180°)
   * 
   * Vertical Rotation Patterns:
   * [△ 0°] [□ 0°] [○ 0°]      Each column: same shape rotating downward
   * [△ 90°][□ 90°][○ 90°]     Column rotation: 0° → 90° → 180°
   * [△ 180°][□ 180°][?]       Answer: ○ 180° (green circle at 180°)
   * 
   * Size Progression Patterns:
   * [★ small][★ med][★ large]   Each row: same shape growing across
   * [◇ small][◇ med][◇ large]   Color changes per row (yellow → purple → blue)
   * [○ small][○ med][?]         Answer: ○ large (large blue circle)
   * 
   * Shape Substitution Patterns:
   * [□ red] [○ red] [△ red]     Each row: shape sequence with same color
   * [□ blue][○ blue][△ blue]    Pattern: square → circle → triangle
   * [□ green][?] [△ green]      Answer: ○ green (green circle)
   * 
   * Fill Progression Patterns:
   * [★ empty][★ ¼][★ ½]        Each row: same shape with increasing fill
   * [◇ empty][◇ ¼][◇ ½]        Fill progression: empty → quarter → half
   * [○ empty][○ ¼][?]          Answer: ○ ½ (half-filled blue circle)
   * 
   * Color Change Patterns:
   * [Same shapes across rows but colors change systematically]
   * [Pattern follows consistent color progression or grouping]
   */

  /**
   * Generate a random transformation puzzle
   */
  getRandom(): TransformationPuzzle {
    const templates = this.getTransformationTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return this.generateFromTemplate(template);
  }

  private getTransformationTemplates() {
    return [
      {
        type: TransformationType.ROTATION,
        direction: TransformationDirection.HORIZONTAL,
        description: 'horizontal rotation'
      },
      {
        type: TransformationType.ROTATION,
        direction: TransformationDirection.VERTICAL,
        description: 'vertical rotation'
      },
      {
        type: TransformationType.SIZE_CHANGE,
        direction: TransformationDirection.HORIZONTAL,
        description: 'horizontal size progression'
      },
      {
        type: TransformationType.COLOR_CHANGE,
        direction: TransformationDirection.HORIZONTAL,
        description: 'horizontal color change'
      },
      {
        type: TransformationType.FILL_CHANGE,
        direction: TransformationDirection.HORIZONTAL,
        description: 'horizontal fill progression'
      },
      {
        type: TransformationType.SHAPE_SUBSTITUTION,
        direction: TransformationDirection.HORIZONTAL,
        description: 'horizontal shape substitution'
      }
    ];
  }

  private generateFromTemplate(template: any): TransformationPuzzle {
    const shapes = Object.values(TransformationShape);
    const colors = Object.values(TransformationColor);
    const sizes = Object.values(TransformationSize);
    const fills = Object.values(TransformationFill);

    // Create base element
    const baseElement: ShapeElement = {
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: sizes[1], // medium
      color: colors[Math.floor(Math.random() * colors.length)],
      fill: fills[Math.floor(Math.random() * fills.length)],
      rotation: TransformationRotation.DEGREES_0 // start at 0°
    };

    // Generate grid based on transformation type
    const grid: (ShapeElement | null)[][] = [
      [null, null, null],
      [null, null, null], 
      [null, null, null]
    ];

    // Choose random missing position
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);

    if (template.type === TransformationType.ROTATION) {
      this.generateRotationPattern(grid, baseElement, template.direction, missingRow, missingCol);
    } else if (template.type === TransformationType.SIZE_CHANGE) {
      this.generateSizePattern(grid, baseElement, template.direction, missingRow, missingCol);
    } else if (template.type === TransformationType.FILL_CHANGE) {
      this.generateFillPattern(grid, baseElement, template.direction, missingRow, missingCol);
    } else {
      this.generateShapeSubstitutionPattern(grid, baseElement, template.direction, missingRow, missingCol);
    }

    // Generate correct answer and distractors
    const correctElement = this.calculateCorrectAnswer(grid, template, missingRow, missingCol);
    const options = this.generateOptions(correctElement);
    
    // Determine difficulty based on transformation complexity
    const difficultyLevel = this.determineDifficulty(template.type);
    
    // Generate semantic ID
    const semanticId = SemanticIdGenerator.generateSemanticId('transformation', template.type, difficultyLevel);
    
    return {
      question: 'What shape completes the transformation pattern?',
      grid,
      missingPosition: { row: missingRow, col: missingCol },
      options,
      correctAnswerIndex: 0, // Will be shuffled
      explanation: this.generateExplanation(template, correctElement),
      transformationType: template.type,
      transformationDirection: template.direction,
      rule: this.generateRule(template),
      // NEW: Semantic metadata
      puzzleType: 'transformation',
      puzzleSubtype: template.type,
      difficultyLevel,
      semanticId
    };
  }

  private generateRotationPattern(grid: (ShapeElement | null)[][], baseElement: ShapeElement, direction: TransformationDirection, missingRow: number, missingCol: number) {
    const rotations = [0, 90, 180, 270];
    
    if (direction === TransformationDirection.HORIZONTAL) {
      // Each row rotates across columns
      for (let row = 0; row < 3; row++) {
        const rowShape = { ...baseElement, color: Object.values(TransformationColor)[row] };
        for (let col = 0; col < 3; col++) {
          if (row !== missingRow || col !== missingCol) {
            grid[row][col] = { ...rowShape, rotation: rotations[col] };
          }
        }
      }
    } else {
      // Each column rotates down rows
      for (let col = 0; col < 3; col++) {
        const colShape = { ...baseElement, color: Object.values(TransformationColor)[col] };
        for (let row = 0; row < 3; row++) {
          if (row !== missingRow || col !== missingCol) {
            grid[row][col] = { ...colShape, rotation: rotations[row] };
          }
        }
      }
    }
  }

  private generateSizePattern(grid: (ShapeElement | null)[][], baseElement: ShapeElement, direction: TransformationDirection, missingRow: number, missingCol: number) {
    const sizes = [TransformationSize.SMALL, TransformationSize.MEDIUM, TransformationSize.LARGE];
    
    for (let row = 0; row < 3; row++) {
      const rowShape = { ...baseElement, color: Object.values(TransformationColor)[row] };
      for (let col = 0; col < 3; col++) {
        if (row !== missingRow || col !== missingCol) {
          grid[row][col] = { ...rowShape, size: sizes[col] };
        }
      }
    }
  }

  private generateFillPattern(grid: (ShapeElement | null)[][], baseElement: ShapeElement, direction: TransformationDirection, missingRow: number, missingCol: number) {
    const fills = [TransformationFill.EMPTY, TransformationFill.QUARTER, TransformationFill.HALF];
    
    for (let row = 0; row < 3; row++) {
      const rowShape = { ...baseElement, color: Object.values(TransformationColor)[row] };
      for (let col = 0; col < 3; col++) {
        if (row !== missingRow || col !== missingCol) {
          grid[row][col] = { ...rowShape, fill: fills[col] };
        }
      }
    }
  }

  private generateShapeSubstitutionPattern(grid: (ShapeElement | null)[][], baseElement: ShapeElement, direction: TransformationDirection, missingRow: number, missingCol: number) {
    const shapes = [TransformationShape.SQUARE, TransformationShape.CIRCLE, TransformationShape.TRIANGLE];
    
    for (let row = 0; row < 3; row++) {
      const rowColor = Object.values(TransformationColor)[row];
      for (let col = 0; col < 3; col++) {
        if (row !== missingRow || col !== missingCol) {
          grid[row][col] = { ...baseElement, shape: shapes[col], color: rowColor };
        }
      }
    }
  }

  private calculateCorrectAnswer(grid: (ShapeElement | null)[][], template: any, missingRow: number, missingCol: number): ShapeElement {
    // Find pattern from existing elements
    if (template.direction === TransformationDirection.HORIZONTAL) {
      // Look at other elements in the same row
      const rowElements = grid[missingRow].filter(el => el !== null) as ShapeElement[];
      if (rowElements.length >= 2) {
        return this.extrapolateFromRow(rowElements, missingCol, template.type);
      }
    }
    
    // Fallback: use template pattern
    const baseColor = Object.values(TransformationColor)[missingRow];
    
    if (template.type === TransformationType.ROTATION) {
      const rotations = [0, 90, 180, 270];
      return {
        shape: TransformationShape.CIRCLE,
        size: TransformationSize.MEDIUM,
        color: baseColor,
        fill: TransformationFill.FULL,
        rotation: rotations[missingCol]
      };
    } else if (template.type === TransformationType.SIZE_CHANGE) {
      const sizes = [TransformationSize.SMALL, TransformationSize.MEDIUM, TransformationSize.LARGE];
      return {
        shape: TransformationShape.CIRCLE,
        size: sizes[missingCol],
        color: baseColor,
        fill: TransformationFill.FULL,
        rotation: TransformationRotation.DEGREES_0
      };
    } else {
      return {
        shape: TransformationShape.CIRCLE,
        size: TransformationSize.MEDIUM,
        color: baseColor,
        fill: TransformationFill.HALF,
        rotation: TransformationRotation.DEGREES_0
      };
    }
  }

  private extrapolateFromRow(rowElements: ShapeElement[], missingCol: number, transformationType: TransformationType): ShapeElement {
    const firstElement = rowElements[0];
    const baseElement = { ...firstElement };
    
    if (transformationType === TransformationType.ROTATION) {
      const rotations = [0, 90, 180, 270];
      baseElement.rotation = rotations[missingCol];
    } else if (transformationType === TransformationType.SIZE_CHANGE) {
      const sizes = [TransformationSize.SMALL, TransformationSize.MEDIUM, TransformationSize.LARGE];
      baseElement.size = sizes[missingCol];
    } else if (transformationType === TransformationType.FILL_CHANGE) {
      const fills = [TransformationFill.EMPTY, TransformationFill.QUARTER, TransformationFill.HALF];
      baseElement.fill = fills[missingCol];
    } else if (transformationType === TransformationType.SHAPE_SUBSTITUTION) {
      const shapes = [TransformationShape.SQUARE, TransformationShape.CIRCLE, TransformationShape.TRIANGLE];
      baseElement.shape = shapes[missingCol];
    }
    
    return baseElement;
  }

  private generateOptions(correctElement: ShapeElement): string[] {
    const correct = this.elementToString(correctElement);
    const options = [correct];
    
    // Generate 3 plausible but incorrect options
    const distractors = [
      this.elementToString({ ...correctElement, shape: this.getRandomDifferentShape(correctElement.shape) }),
      this.elementToString({ ...correctElement, color: this.getRandomDifferentColor(correctElement.color) }),
      this.elementToString({ ...correctElement, size: this.getRandomDifferentSize(correctElement.size) })
    ];
    
    // Ensure uniqueness
    distractors.forEach(distractor => {
      if (!options.includes(distractor)) {
        options.push(distractor);
      }
    });
    
    // Fill remaining slots if needed
    while (options.length < 4) {
      const randomDistractor = this.elementToString({
        ...correctElement,
        shape: Object.values(TransformationShape)[Math.floor(Math.random() * 5)],
        color: Object.values(TransformationColor)[Math.floor(Math.random() * 6)]
      });
      if (!options.includes(randomDistractor)) {
        options.push(randomDistractor);
      }
    }
    
    return options.slice(0, 4);
  }

  private elementToString(element: ShapeElement): string {
    const sizePrefix = element.size === TransformationSize.SMALL ? 'Small ' : 
                      element.size === TransformationSize.LARGE ? 'Large ' : '';
    const fillPrefix = element.fill === TransformationFill.EMPTY ? 'Empty ' :
                      element.fill === TransformationFill.QUARTER ? 'Quarter-filled ' :
                      element.fill === TransformationFill.HALF ? 'Half-filled ' : '';
    const rotationSuffix = element.rotation !== 0 ? ` ${element.rotation}°` : '';
    
    const shapeName = element.shape === TransformationShape.CIRCLE ? 'Circle' :
                     element.shape === TransformationShape.SQUARE ? 'Square' :
                     element.shape === TransformationShape.TRIANGLE ? 'Triangle' :
                     element.shape === TransformationShape.DIAMOND ? 'Diamond' : 'Star';
    
    const colorName = element.color.charAt(0).toUpperCase() + element.color.slice(1);
    
    return `${fillPrefix}${sizePrefix}${colorName} ${shapeName}${rotationSuffix}`;
  }

  private getRandomDifferentShape(currentShape: TransformationShape): TransformationShape {
    const shapes = Object.values(TransformationShape).filter(s => s !== currentShape);
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private getRandomDifferentColor(currentColor: TransformationColor): TransformationColor {
    const colors = Object.values(TransformationColor).filter(c => c !== currentColor);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomDifferentSize(currentSize: TransformationSize): TransformationSize {
    const sizes = Object.values(TransformationSize).filter(s => s !== currentSize);
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private generateExplanation(template: any, correctElement: ShapeElement): string {
    const directionText = template.direction === TransformationDirection.HORIZONTAL ? 'across the row' : 'down the column';
    
    if (template.type === TransformationType.ROTATION) {
      return `Each shape rotates 90° clockwise ${directionText}. The missing element continues this rotation pattern.`;
    } else if (template.type === TransformationType.SIZE_CHANGE) {
      return `Each shape increases in size ${directionText}: small → medium → large. The missing element follows this progression.`;
    } else if (template.type === TransformationType.FILL_CHANGE) {
      return `Each shape increases in fill ${directionText}: empty → quarter → half. The missing element continues this pattern.`;
    } else {
      return `Each row follows a consistent shape sequence with the same color. The missing element completes this pattern.`;
    }
  }

  private generateRule(template: any): string {
    const directionText = template.direction === TransformationDirection.HORIZONTAL ? 'row' : 'column';
    
    if (template.type === TransformationType.ROTATION) {
      return `Each shape rotates 90° clockwise across the ${directionText}`;
    } else if (template.type === TransformationType.SIZE_CHANGE) {
      return `Each shape increases in size across the ${directionText}: small → medium → large`;
    } else if (template.type === TransformationType.FILL_CHANGE) {
      return `Each shape increases in fill across the ${directionText}: empty → quarter → half`;
    } else {
      return `Each ${directionText} follows the pattern: square → circle → triangle in the same color`;
    }
  }
  
  private determineDifficulty(transformationType: TransformationType): 'easy' | 'medium' | 'hard' {
    // Difficulty based on transformation complexity
    const difficultyMap: Record<TransformationType, 'easy' | 'medium' | 'hard'> = {
      [TransformationType.SIZE_CHANGE]: 'easy',         // Simple size progression
      [TransformationType.FILL_CHANGE]: 'easy',         // Simple fill progression  
      [TransformationType.COLOR_CHANGE]: 'medium',      // Color pattern recognition
      [TransformationType.SHAPE_SUBSTITUTION]: 'medium', // Shape sequence pattern
      [TransformationType.ROTATION]: 'hard',            // Complex spatial rotation
      [TransformationType.REFLECTION]: 'hard'           // Complex spatial reflection
    };
    
    return difficultyMap[transformationType] || 'medium';
  }
}

// Export singleton instance
export const transformationPuzzleGenerator = new TransformationPuzzleGenerator();


/**
 * @deprecated Use transformationPuzzleGenerator.getRandom() instead  
 */
export function generateRandomTransformationPuzzle(): TransformationPuzzle & { type: string; correctAnswer: string } {
  const puzzle = transformationPuzzleGenerator.getRandom();
  return {
    ...puzzle,
    type: 'transformation',
    correctAnswer: puzzle.options[puzzle.correctAnswerIndex]
  };
}

export default transformationPuzzleGenerator;