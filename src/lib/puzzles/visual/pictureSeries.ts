import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Enums for series transformation types
export enum SeriesTransformationType {
  GEOMETRIC_PROGRESSION = 'geometric',
  ARITHMETIC_PROGRESSION = 'arithmetic',
  ROTATION_SEQUENCE = 'rotation',
  POSITION_MOVEMENT = 'position',
  SIZE_SCALING = 'size',
  COLOR_CYCLING = 'color',
  PATTERN_ALTERNATION = 'pattern',
  COMPOUND_TRANSFORMATION = 'compound'
}

export enum SeriesShape {
  TRIANGLE = '△',
  SQUARE = '■',
  PENTAGON = '⬟',
  HEXAGON = '⬢',
  CIRCLE = '○',
  STAR = '★',
  DIAMOND = '◆'
}

export enum SeriesColor {
  RED = '🔴',
  BLUE = '🔵',
  GREEN = '🟢',
  YELLOW = '🟡',
  PURPLE = '🟣',
  ORANGE = '🟠'
}

export enum SeriesSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum SeriesPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

// Interface for individual figures in the series
export interface SeriesFigure {
  shape: SeriesShape;
  color?: SeriesColor;
  size: SeriesSize;
  position: SeriesPosition;
  rotation: number; // degrees
  pattern?: string; // for pattern variations
  order: number; // position in sequence (0, 1, 2...)
}

// Main puzzle interface extending BasePuzzle
export interface PictureSeriesPuzzle extends BasePuzzle {
  series: SeriesFigure[];
  seriesLength: number; // 3-4 figures + 1 missing
  transformationType: SeriesTransformationType;
  hiddenIndex: number; // Index of the missing figure (usually last)
  nextFigure: SeriesFigure; // The correct continuation
}

/**
 * Picture Series Puzzle Generator
 * Generates sequences of 3-4 figures with logical progressions for "what comes next" reasoning.
 * Based on OLSAT-style Picture/Figural Series puzzles.
 */
export class PictureSeriesPuzzleGenerator extends BasePuzzleGenerator<PictureSeriesPuzzle> {
  
  private determineDifficulty(transformationType: SeriesTransformationType, seriesLength: number): 'easy' | 'medium' | 'hard' {
    // Map transformation types and series lengths to difficulty
    if (transformationType === SeriesTransformationType.ARITHMETIC_PROGRESSION) {
      return 'easy';
    } else if (transformationType === SeriesTransformationType.GEOMETRIC_PROGRESSION || 
               transformationType === SeriesTransformationType.POSITION_MOVEMENT) {
      return seriesLength <= 3 ? 'easy' : 'medium';
    } else if (transformationType === SeriesTransformationType.ROTATION_SEQUENCE ||
               transformationType === SeriesTransformationType.SIZE_SCALING ||
               transformationType === SeriesTransformationType.COLOR_CYCLING) {
      return 'medium';
    } else {
      return 'hard'; // PATTERN_ALTERNATION, COMPOUND_TRANSFORMATION
    }
  }

  private transformationTypeToSubtype(transformationType: SeriesTransformationType): string {
    const subtypeMap: Record<SeriesTransformationType, string> = {
      [SeriesTransformationType.GEOMETRIC_PROGRESSION]: 'geometric',
      [SeriesTransformationType.ARITHMETIC_PROGRESSION]: 'arithmetic',
      [SeriesTransformationType.ROTATION_SEQUENCE]: 'rotation',
      [SeriesTransformationType.POSITION_MOVEMENT]: 'position',
      [SeriesTransformationType.SIZE_SCALING]: 'size',
      [SeriesTransformationType.COLOR_CYCLING]: 'color',
      [SeriesTransformationType.PATTERN_ALTERNATION]: 'pattern',
      [SeriesTransformationType.COMPOUND_TRANSFORMATION]: 'compound'
    };
    return subtypeMap[transformationType] || 'unknown';
  }

  /**
   * Example picture series puzzles that the dynamic generator creates for developer reference:
   * 
   * Geometric Progression (25% easy-medium):
   * [△] → [■] → [⬟] → [?]     Shape sides: 3 → 4 → 5 → 6 (hexagon ⬢)
   * [○] → [△] → [■] → [?]     Increasing complexity: circle → triangle → square → pentagon
   * 
   * Arithmetic Progression (20% easy):
   * [■] → [■■] → [■■■] → [?]    Count increases by 1: Answer ■■■■
   * [○] → [○○] → [○○○] → [?]    Simple counting progression
   * 
   * Rotation Sequence (20% medium):
   * [△ 0°] → [△ 90°] → [△ 180°] → [?]    Answer: △ 270° (▽)
   * [★ 0°] → [★ 45°] → [★ 90°] → [?]     Answer: ★ 135°
   * 
   * Position Movement (15% easy-medium):
   * [○ left] → [○ center] → [○ right] → [?]    Linear movement
   * [■ top] → [■ center] → [■ bottom] → [?]    Vertical progression
   * 
   * Size Scaling (10% medium):
   * [○ small] → [○ medium] → [○ large] → [?]    Cycles back to small
   * [■ large] → [■ medium] → [■ small] → [?]    Decreasing size
   * 
   * Color Cycling (10% medium):
   * [○ red] → [○ blue] → [○ green] → [?]    Color cycle continues
   * [■ yellow] → [■ purple] → [■ orange] → [?]   Color progression
   * 
   * Pattern Alternation (rare, 5% hard):
   * [●] → [○] → [●] → [?]    Alternating filled/empty: Answer ○
   * [▲] → [△] → [▲] → [?]    Alternating solid/outline: Answer △
   * 
   * Compound Transformation (rare, 5% hard):
   * [△ red small] → [■ blue medium] → [⬟ green large] → [?]
   * Multiple attributes change: shape+color+size progression
   * 
   * Difficulty Distribution:
   * - Easy (30%): 3-figure sequences, single attribute change
   * - Easy-Medium (25%): 3-4 figures, clear progressions
   * - Medium (25%): 4 figures, rotation/position changes
   * - Medium-Hard (15%): Complex rules, multiple cycles
   * - Hard (5%): Compound transformations, alternating patterns
   */

  /**
   * Generate random picture series puzzle
   */
  getRandom(): PictureSeriesPuzzle {
    const numericDifficulty = this.getRandomNumericDifficulty();
    const transformationType = this.getRandomTransformation(numericDifficulty);
    const seriesLength = this.getSeriesLengthForNumericDifficulty(numericDifficulty);
    
    switch (transformationType) {
      case SeriesTransformationType.GEOMETRIC_PROGRESSION:
        return this.generateGeometricSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.ARITHMETIC_PROGRESSION:
        return this.generateArithmeticSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.ROTATION_SEQUENCE:
        return this.generateRotationSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.POSITION_MOVEMENT:
        return this.generatePositionSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.SIZE_SCALING:
        return this.generateSizeSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.COLOR_CYCLING:
        return this.generateColorSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.PATTERN_ALTERNATION:
        return this.generatePatternSeries(numericDifficulty, seriesLength);
      case SeriesTransformationType.COMPOUND_TRANSFORMATION:
        return this.generateCompoundSeries(numericDifficulty, seriesLength);
      default:
        return this.generateGeometricSeries(numericDifficulty, seriesLength);
    }
  }

  private getRandomNumericDifficulty(): 1 | 2 | 3 | 4 | 5 {
    const rand = Math.random();
    if (rand < 0.30) return 1;      // 30% easy
    if (rand < 0.55) return 2;      // 25% easy-medium
    if (rand < 0.80) return 3;      // 25% medium
    if (rand < 0.95) return 4;      // 15% medium-hard
    return 5;                       // 5% hard
  }

  private getRandomTransformation(difficulty: number): SeriesTransformationType {
    // Weight transformations by difficulty
    if (difficulty <= 2) {
      const easyTypes = [
        SeriesTransformationType.GEOMETRIC_PROGRESSION,
        SeriesTransformationType.ARITHMETIC_PROGRESSION,
        SeriesTransformationType.POSITION_MOVEMENT
      ];
      return easyTypes[Math.floor(Math.random() * easyTypes.length)];
    } else if (difficulty <= 3) {
      const mediumTypes = [
        SeriesTransformationType.GEOMETRIC_PROGRESSION,
        SeriesTransformationType.ROTATION_SEQUENCE,
        SeriesTransformationType.SIZE_SCALING,
        SeriesTransformationType.COLOR_CYCLING
      ];
      return mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
    } else {
      const hardTypes = [
        SeriesTransformationType.PATTERN_ALTERNATION,
        SeriesTransformationType.COMPOUND_TRANSFORMATION,
        SeriesTransformationType.ROTATION_SEQUENCE
      ];
      return hardTypes[Math.floor(Math.random() * hardTypes.length)];
    }
  }

  private getSeriesLengthForNumericDifficulty(difficulty: 1 | 2 | 3 | 4 | 5): number {
    if (difficulty <= 2) return 3;  // Easy: 3 figures
    return 4;                       // Medium-Hard: 4 figures
  }

  private generateGeometricSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shapes = [SeriesShape.TRIANGLE, SeriesShape.SQUARE, SeriesShape.PENTAGON, SeriesShape.HEXAGON, SeriesShape.CIRCLE];
    const series: SeriesFigure[] = [];
    
    // Create sequence of shapes with geometric progression
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape: shapes[i % shapes.length],
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: i
      });
    }

    const nextShape = shapes[seriesLength % shapes.length];
    const nextFigure: SeriesFigure = {
      shape: nextShape,
      size: SeriesSize.MEDIUM,
      position: SeriesPosition.CENTER,
      rotation: 0,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.GEOMETRIC_PROGRESSION);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.GEOMETRIC_PROGRESSION);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.GEOMETRIC_PROGRESSION, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'What comes next in the shape sequence?',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.GEOMETRIC_PROGRESSION,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.GEOMETRIC_PROGRESSION, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generateArithmeticSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const baseShape = SeriesShape.CIRCLE;
    const series: SeriesFigure[] = [];
    
    // Create arithmetic progression by count (represented as repeated symbols)
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape: baseShape,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        pattern: baseShape.repeat(i + 1), // 1, 2, 3, 4...
        order: i
      });
    }

    const nextFigure: SeriesFigure = {
      shape: baseShape,
      size: SeriesSize.MEDIUM,
      position: SeriesPosition.CENTER,
      rotation: 0,
      pattern: baseShape.repeat(seriesLength + 1),
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.ARITHMETIC_PROGRESSION);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.ARITHMETIC_PROGRESSION);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.ARITHMETIC_PROGRESSION, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'Complete the counting sequence.',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.ARITHMETIC_PROGRESSION,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.ARITHMETIC_PROGRESSION, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generateRotationSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shape = SeriesShape.TRIANGLE;
    const rotationStep = difficulty <= 2 ? 90 : 45; // Easier: 90°, Harder: 45°
    const series: SeriesFigure[] = [];
    
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: (i * rotationStep) % 360,
        order: i
      });
    }

    const nextRotation = (seriesLength * rotationStep) % 360;
    const nextFigure: SeriesFigure = {
      shape,
      size: SeriesSize.MEDIUM,
      position: SeriesPosition.CENTER,
      rotation: nextRotation,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.ROTATION_SEQUENCE);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.ROTATION_SEQUENCE);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.ROTATION_SEQUENCE, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'Find the next figure in the rotation series.',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.ROTATION_SEQUENCE,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.ROTATION_SEQUENCE, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generatePositionSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shape = SeriesShape.CIRCLE;
    const positions = [SeriesPosition.LEFT, SeriesPosition.CENTER, SeriesPosition.RIGHT];
    const series: SeriesFigure[] = [];
    
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape,
        size: SeriesSize.MEDIUM,
        position: positions[i % positions.length],
        rotation: 0,
        order: i
      });
    }

    const nextPosition = positions[seriesLength % positions.length];
    const nextFigure: SeriesFigure = {
      shape,
      size: SeriesSize.MEDIUM,
      position: nextPosition,
      rotation: 0,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.POSITION_MOVEMENT);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.POSITION_MOVEMENT);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.POSITION_MOVEMENT, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'Where does the shape move next?',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.POSITION_MOVEMENT,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.POSITION_MOVEMENT, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generateSizeSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shape = SeriesShape.SQUARE;
    const sizes = [SeriesSize.SMALL, SeriesSize.MEDIUM, SeriesSize.LARGE];
    const series: SeriesFigure[] = [];
    
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape,
        size: sizes[i % sizes.length],
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: i
      });
    }

    const nextSize = sizes[seriesLength % sizes.length];
    const nextFigure: SeriesFigure = {
      shape,
      size: nextSize,
      position: SeriesPosition.CENTER,
      rotation: 0,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.SIZE_SCALING);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.SIZE_SCALING);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.SIZE_SCALING, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'What size comes next in the series?',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.SIZE_SCALING,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.SIZE_SCALING, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generateColorSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shape = SeriesShape.CIRCLE;
    const colors = [SeriesColor.RED, SeriesColor.BLUE, SeriesColor.GREEN, SeriesColor.YELLOW];
    const series: SeriesFigure[] = [];
    
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape,
        color: colors[i % colors.length],
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: i
      });
    }

    const nextColor = colors[seriesLength % colors.length];
    const nextFigure: SeriesFigure = {
      shape,
      color: nextColor,
      size: SeriesSize.MEDIUM,
      position: SeriesPosition.CENTER,
      rotation: 0,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.COLOR_CYCLING);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.COLOR_CYCLING);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.COLOR_CYCLING, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'What color comes next in the cycle?',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.COLOR_CYCLING,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.COLOR_CYCLING, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generatePatternSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shape = SeriesShape.CIRCLE;
    const patterns = ['filled', 'empty', 'filled', 'empty']; // Alternating pattern
    const series: SeriesFigure[] = [];
    
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        pattern: patterns[i % patterns.length],
        order: i
      });
    }

    const nextPattern = patterns[seriesLength % patterns.length];
    const nextFigure: SeriesFigure = {
      shape,
      size: SeriesSize.MEDIUM,
      position: SeriesPosition.CENTER,
      rotation: 0,
      pattern: nextPattern,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.PATTERN_ALTERNATION);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.PATTERN_ALTERNATION);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.PATTERN_ALTERNATION, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'Complete the alternating pattern.',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.PATTERN_ALTERNATION,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.PATTERN_ALTERNATION, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  private generateCompoundSeries(difficulty: number, seriesLength: number): PictureSeriesPuzzle {
    const shapes = [SeriesShape.TRIANGLE, SeriesShape.SQUARE, SeriesShape.PENTAGON];
    const colors = [SeriesColor.RED, SeriesColor.BLUE, SeriesColor.GREEN];
    const sizes = [SeriesSize.SMALL, SeriesSize.MEDIUM, SeriesSize.LARGE];
    const series: SeriesFigure[] = [];
    
    // Multiple attributes change together
    for (let i = 0; i < seriesLength; i++) {
      series.push({
        shape: shapes[i % shapes.length],
        color: colors[i % colors.length],
        size: sizes[i % sizes.length],
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: i
      });
    }

    const nextFigure: SeriesFigure = {
      shape: shapes[seriesLength % shapes.length],
      color: colors[seriesLength % colors.length],
      size: sizes[seriesLength % sizes.length],
      position: SeriesPosition.CENTER,
      rotation: 0,
      order: seriesLength
    };

    const wrongOptions = this.generateWrongOptions(nextFigure, SeriesTransformationType.COMPOUND_TRANSFORMATION);
    const options = [this.figureToString(nextFigure), ...wrongOptions];
    this.shuffleArray(options);
    const correctIndex = options.indexOf(this.figureToString(nextFigure));

    const subtype = this.transformationTypeToSubtype(SeriesTransformationType.COMPOUND_TRANSFORMATION);
    const difficultyLevel = this.determineDifficulty(SeriesTransformationType.COMPOUND_TRANSFORMATION, seriesLength);
    const semanticId = SemanticIdGenerator.generateSemanticId('picture-series', subtype, difficultyLevel);

    return {
      question: 'What figure continues this complex series?',
      series,
      seriesLength,
      transformationType: SeriesTransformationType.COMPOUND_TRANSFORMATION,
      nextFigure,
      options,
      correctAnswerIndex: correctIndex,
      hiddenIndex: seriesLength - 1, // Last figure is always hidden
      explanation: this.generateExplanation(SeriesTransformationType.COMPOUND_TRANSFORMATION, series, nextFigure),
      puzzleType: 'picture-series',
      puzzleSubtype: subtype,
      difficultyLevel,
      semanticId
    };
  }

  // Helper methods
  private figureToString(figure: SeriesFigure): string {
    let result = '';
    
    // Handle pattern (like repeated symbols)
    if (figure.pattern && figure.pattern !== figure.shape) {
      return figure.pattern;
    }
    
    // Handle rotation
    if (figure.rotation > 0) {
      const rotatedShape = this.rotateShape(figure.shape, figure.rotation);
      result = rotatedShape;
    } else {
      result = figure.shape;
    }
    
    // Handle color
    if (figure.color) {
      result = `${figure.color}${result}`;
    }
    
    // Handle size (represented by symbol size/repetition for simple display)
    if (figure.size === SeriesSize.SMALL) {
      result = `◦${result}◦`; // Small indicator
    } else if (figure.size === SeriesSize.LARGE) {
      result = `●${result}●`; // Large indicator
    }
    
    // Handle position
    if (figure.position === SeriesPosition.LEFT) {
      result = `◀${result}`;
    } else if (figure.position === SeriesPosition.RIGHT) {
      result = `${result}▶`;
    } else if (figure.position === SeriesPosition.TOP) {
      result = `▲${result}`;
    } else if (figure.position === SeriesPosition.BOTTOM) {
      result = `${result}▼`;
    }
    
    return result || figure.shape;
  }

  private rotateShape(shape: SeriesShape, rotation: number): string {
    if (shape === SeriesShape.TRIANGLE) {
      switch (rotation) {
        case 0: return '△';
        case 90: return '▷';
        case 180: return '▽';
        case 270: return '◁';
        case 45: return '🔼';
        case 135: return '▶';
        case 225: return '🔽';
        case 315: return '◀';
        default: return '△';
      }
    }
    return shape; // Other shapes don't have clear rotation variants
  }

  private generateWrongOptions(correctFigure: SeriesFigure, transformationType: SeriesTransformationType): string[] {
    const wrongOptions: string[] = [];
    const correctString = this.figureToString(correctFigure);
    
    switch (transformationType) {
      case SeriesTransformationType.GEOMETRIC_PROGRESSION:
        const shapes = ['△', '■', '⬟', '⬢', '○', '★'];
        shapes.filter(s => s !== correctString).forEach(s => wrongOptions.push(s));
        break;
        
      case SeriesTransformationType.ARITHMETIC_PROGRESSION:
        const baseShape = correctFigure.shape;
        wrongOptions.push(baseShape.repeat(1), baseShape.repeat(2), baseShape.repeat(6), baseShape.repeat(8));
        break;
        
      case SeriesTransformationType.ROTATION_SEQUENCE:
        wrongOptions.push('△', '▷', '▽', '◁', '🔼', '▶');
        break;
        
      case SeriesTransformationType.POSITION_MOVEMENT:
        wrongOptions.push('◀○', '○', '○▶', '▲○', '○▼');
        break;
        
      case SeriesTransformationType.SIZE_SCALING:
        wrongOptions.push('◦■◦', '■', '●■●', '◦◦■◦◦');
        break;
        
      case SeriesTransformationType.COLOR_CYCLING:
        wrongOptions.push('🔴○', '🔵○', '🟢○', '🟡○', '🟣○');
        break;
        
      case SeriesTransformationType.PATTERN_ALTERNATION:
        wrongOptions.push('●', '○', '◐', '◑');
        break;
        
      case SeriesTransformationType.COMPOUND_TRANSFORMATION:
        wrongOptions.push('🔴△', '🔵■', '🟢⬟', '🟡⬢', '🟣○');
        break;
    }
    
    // Filter out the correct answer and ensure at least 3 wrong options
    const filteredOptions = wrongOptions.filter(opt => opt !== correctString);
    
    // Add generic fallbacks if needed
    while (filteredOptions.length < 3) {
      const fallbacks = ['?', '※', '✕', '✗'];
      const fallback = fallbacks[filteredOptions.length % fallbacks.length];
      if (!filteredOptions.includes(fallback)) {
        filteredOptions.push(fallback);
      }
    }
    
    return filteredOptions.slice(0, 3);
  }

  private generateExplanation(type: SeriesTransformationType, series: SeriesFigure[], nextFigure: SeriesFigure): string {
    switch (type) {
      case SeriesTransformationType.GEOMETRIC_PROGRESSION:
        return 'The series shows a geometric progression where each shape increases in complexity or follows a mathematical pattern of sides/features.';
      case SeriesTransformationType.ARITHMETIC_PROGRESSION:
        return 'The series shows an arithmetic progression where the count increases by 1 in each step.';
      case SeriesTransformationType.ROTATION_SEQUENCE:
        return 'The shape rotates by a fixed angle in each step. Follow the rotation pattern to find the next position.';
      case SeriesTransformationType.POSITION_MOVEMENT:
        return 'The shape moves systematically from position to position. The movement follows a predictable pattern.';
      case SeriesTransformationType.SIZE_SCALING:
        return 'The size changes in a cyclical pattern: small → medium → large → back to small.';
      case SeriesTransformationType.COLOR_CYCLING:
        return 'The color cycles through a fixed sequence and repeats. Follow the color pattern to find the next one.';
      case SeriesTransformationType.PATTERN_ALTERNATION:
        return 'The pattern alternates between two states (filled/empty, solid/outline). Continue the alternating sequence.';
      case SeriesTransformationType.COMPOUND_TRANSFORMATION:
        return 'Multiple attributes (shape, color, size) change together following their own patterns simultaneously.';
      default:
        return 'Follow the logical progression to determine what comes next in the series.';
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
export const pictureSeriesPuzzleGenerator = new PictureSeriesPuzzleGenerator();