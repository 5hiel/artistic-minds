import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Enums for figure properties
export enum FigureShape {
  CIRCLE = '●',
  SQUARE = '■',
  TRIANGLE = '▲',
  DIAMOND = '◆',
  STAR = '★',
  HEXAGON = '⬢',
  RECTANGLE = '▬',
  PENTAGON = '⬟'
}

export enum FigureSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum FigureColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
  BLACK = 'black',
  GRAY = 'gray'
}

export enum FigurePattern {
  SOLID = 'solid',
  STRIPED = 'striped',
  DOTTED = 'dotted',
  HOLLOW = 'hollow',
  CHECKERED = 'checkered'
}

export enum FigureRotation {
  DEGREES_0 = 0,
  DEGREES_45 = 45,
  DEGREES_90 = 90,
  DEGREES_135 = 135,
  DEGREES_180 = 180,
  DEGREES_225 = 225,
  DEGREES_270 = 270,
  DEGREES_315 = 315
}

export enum ClassificationRule {
  SHAPE = 'shape',
  SIZE = 'size',
  COLOR = 'color',
  PATTERN = 'pattern',
  ROTATION = 'rotation',
  COUNT = 'count',
  POSITION = 'position',
  MULTI_CRITERIA = 'multi-criteria'
}

// Figure element interface
export interface FigureElement {
  shape: FigureShape;
  size: FigureSize;
  color: FigureColor;
  pattern: FigurePattern;
  rotation: FigureRotation;
  count: number;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom';
}

// Figure Classification puzzle interface
export interface FigureClassificationPuzzle extends BasePuzzle {
  figures: FigureElement[];          // 5 figures to classify
  oddOneOutIndex: number;            // Index of the figure that doesn't belong
  classificationRule: ClassificationRule; // Rule type used
  criteriaDescription: string;       // Human-readable rule explanation
}

/**
 * Figure Classification Puzzle Generator
 * 
 * Creates puzzles where users identify which figure doesn't belong in a group.
 * Based on standardized cognitive assessment tests (CogAT, OLSAT, NNAT).
 */
export class FigureClassificationPuzzleGenerator extends BasePuzzleGenerator<FigureClassificationPuzzle> {
  
  private determineDifficulty(rule: ClassificationRule): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<ClassificationRule, 'easy' | 'medium' | 'hard'> = {
      [ClassificationRule.SHAPE]: 'easy',
      [ClassificationRule.SIZE]: 'easy',
      [ClassificationRule.COLOR]: 'easy',
      [ClassificationRule.PATTERN]: 'medium',
      [ClassificationRule.ROTATION]: 'medium',
      [ClassificationRule.COUNT]: 'medium',
      [ClassificationRule.POSITION]: 'hard',
      [ClassificationRule.MULTI_CRITERIA]: 'hard'
    };
    return difficultyMap[rule] || 'medium';
  }
  
  /**
   * Example patterns that the dynamic generator creates for developer reference:
   * 
   * Shape Classification (25%):
   * ● ● ● ● ■    Four circles, one square
   * Answer: E (position 4) - Different shape
   * 
   * Size Classification (20%):
   * ● ● ● ● ●    Four large circles, one small circle
   *   (L L L L S)
   * Answer: E - Different size
   * 
   * Color Classification (20%):
   * ● ● ● ● ●    Four red circles, one blue circle
   * Answer: E - Different color
   * 
   * Pattern Classification (15%):
   * ● ● ● ● ○    Four solid circles, one hollow circle
   * Answer: E - Different pattern
   * 
   * Rotation Classification (10%):
   * ▲ ▲ ▲ ▲ ▼   Four upright triangles, one inverted
   * Answer: E - Different rotation
   * 
   * Count Classification (5%):
   * ● ● ● ● ●●   Four single circles, one double circle
   * Answer: E - Different count
   * 
   * Multi-criteria Classification (5%):
   * Complex combinations of the above criteria
   */

  /**
   * Dynamically generate a random figure classification puzzle
   */
  getRandom(): FigureClassificationPuzzle {
    const rule = this.selectClassificationRule();
    const figures = this.generateFigureSet(rule);
    const oddOneOutIndex = this.determineOddOneOut(figures, rule);
    
    // Generate answer options (A, B, C, D, E for positions 0-4)
    const options = ['A', 'B', 'C', 'D', 'E'];
    const correctAnswerIndex = oddOneOutIndex;
    
    // Generate wrong options by shuffling and excluding correct
    const shuffledOptions = [...options];
    this.shuffleArray(shuffledOptions);
    const finalOptions = shuffledOptions.slice(0, 4);
    
    // Ensure correct answer is included
    if (!finalOptions.includes(options[correctAnswerIndex])) {
      finalOptions[Math.floor(Math.random() * 4)] = options[correctAnswerIndex];
    }
    
    const actualCorrectIndex = finalOptions.indexOf(options[correctAnswerIndex]);
    
    const difficultyLevel = this.determineDifficulty(rule);
    const semanticId = SemanticIdGenerator.generateSemanticId('figure-classification', rule, difficultyLevel);
    
    return {
      question: 'Which figure does NOT belong with the others?',
      figures,
      oddOneOutIndex,
      classificationRule: rule,
      criteriaDescription: this.generateCriteriaDescription(figures, rule, oddOneOutIndex),
      options: finalOptions,
      correctAnswerIndex: actualCorrectIndex,
      explanation: this.generateExplanation(figures, rule, oddOneOutIndex),
      puzzleType: 'figure-classification',
      puzzleSubtype: rule,
      difficultyLevel,
      semanticId
    };
  }

  private selectClassificationRule(): ClassificationRule {
    const rules = [
      { rule: ClassificationRule.SHAPE, weight: 25 },
      { rule: ClassificationRule.SIZE, weight: 20 },
      { rule: ClassificationRule.COLOR, weight: 20 },
      { rule: ClassificationRule.PATTERN, weight: 15 },
      { rule: ClassificationRule.ROTATION, weight: 10 },
      { rule: ClassificationRule.COUNT, weight: 5 },
      { rule: ClassificationRule.MULTI_CRITERIA, weight: 5 }
    ];

    const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const ruleData of rules) {
      if (random < ruleData.weight) {
        return ruleData.rule;
      }
      random -= ruleData.weight;
    }
    
    return ClassificationRule.SHAPE; // Fallback
  }

  private generateFigureSet(rule: ClassificationRule): FigureElement[] {
    switch (rule) {
      case ClassificationRule.SHAPE:
        return this.generateShapeBasedSet();
      case ClassificationRule.SIZE:
        return this.generateSizeBasedSet();
      case ClassificationRule.COLOR:
        return this.generateColorBasedSet();
      case ClassificationRule.PATTERN:
        return this.generatePatternBasedSet();
      case ClassificationRule.ROTATION:
        return this.generateRotationBasedSet();
      case ClassificationRule.COUNT:
        return this.generateCountBasedSet();
      case ClassificationRule.MULTI_CRITERIA:
        return this.generateMultiCriteriaSet();
      default:
        return this.generateShapeBasedSet();
    }
  }

  private generateShapeBasedSet(): FigureElement[] {
    const commonShape = this.getRandomShape();
    const differentShape = this.getDifferentShape(commonShape);
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common shape
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        shape: commonShape
      });
    }
    
    // Create 1 figure with different shape  
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      shape: differentShape
    });
    
    // Randomize positions
    this.shuffleArray(figures);
    return figures;
  }

  private generateSizeBasedSet(): FigureElement[] {
    const commonSize = this.getRandomSize();
    const differentSize = this.getDifferentSize(commonSize);
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common size
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        size: commonSize
      });
    }
    
    // Create 1 figure with different size
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      size: differentSize
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private generateColorBasedSet(): FigureElement[] {
    const commonColor = this.getRandomColor();
    const differentColor = this.getDifferentColor(commonColor);
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common color
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        color: commonColor
      });
    }
    
    // Create 1 figure with different color
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      color: differentColor
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private generatePatternBasedSet(): FigureElement[] {
    const commonPattern = this.getRandomPattern();
    const differentPattern = this.getDifferentPattern(commonPattern);
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common pattern
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        pattern: commonPattern
      });
    }
    
    // Create 1 figure with different pattern
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      pattern: differentPattern
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private generateRotationBasedSet(): FigureElement[] {
    const commonRotation = this.getRandomRotation();
    const differentRotation = this.getDifferentRotation(commonRotation);
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common rotation
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        rotation: commonRotation
      });
    }
    
    // Create 1 figure with different rotation
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      rotation: differentRotation
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private generateCountBasedSet(): FigureElement[] {
    const commonCount = Math.random() < 0.5 ? 1 : 2;
    const differentCount = commonCount === 1 ? 2 : 1;
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common count
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        count: commonCount
      });
    }
    
    // Create 1 figure with different count
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      count: differentCount
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private generateMultiCriteriaSet(): FigureElement[] {
    // For multi-criteria, use combination of shape AND color
    const commonShape = this.getRandomShape();
    const commonColor = this.getRandomColor();
    
    const figures: FigureElement[] = [];
    
    // Create 4 figures with common shape AND color
    for (let i = 0; i < 4; i++) {
      const baseProps = this.getFullBaseProperties();
      figures.push({
        ...baseProps,
        shape: commonShape,
        color: commonColor
      });
    }
    
    // Create 1 figure that differs in one criteria
    const differentShape = this.getDifferentShape(commonShape);
    const baseProps = this.getFullBaseProperties();
    figures.push({
      ...baseProps,
      shape: differentShape, // Different shape but same color
      color: commonColor
    });
    
    this.shuffleArray(figures);
    return figures;
  }

  private determineOddOneOut(figures: FigureElement[], rule: ClassificationRule): number {
    // Find the index of the figure that doesn't match the majority
    const counts = new Map<string, number[]>();
    
    figures.forEach((figure, index) => {
      const key = this.getClassificationKey(figure, rule);
      if (!counts.has(key)) {
        counts.set(key, []);
      }
      counts.get(key)!.push(index);
    });
    
    // Find the group with only 1 member (the odd one out)
    for (const [, indices] of counts.entries()) {
      if (indices.length === 1) {
        return indices[0];
      }
    }
    
    return 0; // Fallback
  }

  private getClassificationKey(figure: FigureElement, rule: ClassificationRule): string {
    switch (rule) {
      case ClassificationRule.SHAPE:
        return figure.shape;
      case ClassificationRule.SIZE:
        return figure.size;
      case ClassificationRule.COLOR:
        return figure.color;
      case ClassificationRule.PATTERN:
        return figure.pattern;
      case ClassificationRule.ROTATION:
        return figure.rotation.toString();
      case ClassificationRule.COUNT:
        return figure.count.toString();
      case ClassificationRule.MULTI_CRITERIA:
        return `${figure.shape}-${figure.color}`;
      default:
        return figure.shape;
    }
  }

  private generateCriteriaDescription(figures: FigureElement[], rule: ClassificationRule, oddIndex: number): string {
    const oddFigure = figures[oddIndex];
    const commonFigures = figures.filter((_, i) => i !== oddIndex);
    
    switch (rule) {
      case ClassificationRule.SHAPE:
        return `Four figures have the same shape (${commonFigures[0].shape}), one has a different shape (${oddFigure.shape})`;
      case ClassificationRule.SIZE:
        return `Four figures are ${commonFigures[0].size}, one is ${oddFigure.size}`;
      case ClassificationRule.COLOR:
        return `Four figures are ${commonFigures[0].color}, one is ${oddFigure.color}`;
      case ClassificationRule.PATTERN:
        return `Four figures have ${commonFigures[0].pattern} pattern, one has ${oddFigure.pattern} pattern`;
      case ClassificationRule.ROTATION:
        return `Four figures are rotated ${commonFigures[0].rotation}°, one is rotated ${oddFigure.rotation}°`;
      case ClassificationRule.COUNT:
        return `Four figures have ${commonFigures[0].count} element(s), one has ${oddFigure.count} element(s)`;
      case ClassificationRule.MULTI_CRITERIA:
        return `Four figures are ${commonFigures[0].color} ${commonFigures[0].shape}s, one is a different shape`;
      default:
        return 'Four figures share a common property, one is different';
    }
  }

  private generateExplanation(figures: FigureElement[], rule: ClassificationRule, oddIndex: number): string {
    const position = String.fromCharCode(65 + oddIndex); // A, B, C, D, E
    const criteriaDesc = this.generateCriteriaDescription(figures, rule, oddIndex);
    
    return `The answer is ${position}. ${criteriaDesc}. In figure classification, you need to identify the common property that most figures share, then find the one that doesn't fit this pattern.`;
  }

  // Helper methods for generating random properties
  private getRandomShape(): FigureShape {
    const shapes = Object.values(FigureShape);
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private getDifferentShape(excludeShape: FigureShape): FigureShape {
    const shapes = Object.values(FigureShape).filter(s => s !== excludeShape);
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private getRandomSize(): FigureSize {
    const sizes = Object.values(FigureSize);
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private getDifferentSize(excludeSize: FigureSize): FigureSize {
    const sizes = Object.values(FigureSize).filter(s => s !== excludeSize);
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private getRandomColor(): FigureColor {
    const colors = Object.values(FigureColor);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getDifferentColor(excludeColor: FigureColor): FigureColor {
    const colors = Object.values(FigureColor).filter(c => c !== excludeColor);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomPattern(): FigurePattern {
    const patterns = Object.values(FigurePattern);
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getDifferentPattern(excludePattern: FigurePattern): FigurePattern {
    const patterns = Object.values(FigurePattern).filter(p => p !== excludePattern);
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getRandomRotation(): FigureRotation {
    const rotations = Object.values(FigureRotation).filter(r => typeof r === 'number') as FigureRotation[];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }

  private getDifferentRotation(excludeRotation: FigureRotation): FigureRotation {
    const rotations = Object.values(FigureRotation).filter(r => typeof r === 'number' && r !== excludeRotation) as FigureRotation[];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }

  private getBaseProperties(): Omit<FigureElement, 'shape' | 'size' | 'color' | 'pattern' | 'rotation' | 'count'> {
    return {
      position: 'center'
    };
  }

  private getFullBaseProperties(): FigureElement {
    return {
      shape: this.getRandomShape(),
      size: this.getRandomSize(),
      color: this.getRandomColor(),
      pattern: this.getRandomPattern(),
      rotation: this.getRandomRotation(),
      count: Math.floor(Math.random() * 3) + 1,
      position: 'center'
    };
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// Export singleton instance for backward compatibility
export const figureClassificationPuzzleGenerator = new FigureClassificationPuzzleGenerator();

export default figureClassificationPuzzleGenerator;