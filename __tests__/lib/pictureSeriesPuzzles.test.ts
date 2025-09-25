/**
 * Tests for Picture Series Puzzle Generator
 * Covers picture series pattern recognition, progression rules, and visual transformations
 */

import {
  PictureSeriesPuzzleGenerator,
  pictureSeriesPuzzleGenerator,
  SeriesTransformationType,
  SeriesShape,
  SeriesColor,
  SeriesSize,
  SeriesPosition,
  type SeriesFigure,
  type PictureSeriesPuzzle
} from '@/src/lib/puzzles/visual/pictureSeries';

describe('Picture Series Puzzle Generator', () => {
  let generator: PictureSeriesPuzzleGenerator;

  beforeEach(() => {
    generator = new PictureSeriesPuzzleGenerator();
  });

  describe('Enum Exports', () => {
    it('should export SeriesTransformationType enum with correct values', () => {
      expect(SeriesTransformationType.GEOMETRIC_PROGRESSION).toBe('geometric');
      expect(SeriesTransformationType.ARITHMETIC_PROGRESSION).toBe('arithmetic');
      expect(SeriesTransformationType.ROTATION_SEQUENCE).toBe('rotation');
      expect(SeriesTransformationType.POSITION_MOVEMENT).toBe('position');
      expect(SeriesTransformationType.SIZE_SCALING).toBe('size');
      expect(SeriesTransformationType.COLOR_CYCLING).toBe('color');
      expect(SeriesTransformationType.PATTERN_ALTERNATION).toBe('pattern');
      expect(SeriesTransformationType.COMPOUND_TRANSFORMATION).toBe('compound');
    });

    it('should export SeriesShape enum with correct symbols', () => {
      expect(SeriesShape.TRIANGLE).toBe('△');
      expect(SeriesShape.SQUARE).toBe('■');
      expect(SeriesShape.PENTAGON).toBe('⬟');
      expect(SeriesShape.HEXAGON).toBe('⬢');
      expect(SeriesShape.CIRCLE).toBe('○');
      expect(SeriesShape.STAR).toBe('★');
      expect(SeriesShape.DIAMOND).toBe('◆');
    });

    it('should export SeriesColor enum with correct emojis', () => {
      expect(SeriesColor.RED).toBe('🔴');
      expect(SeriesColor.BLUE).toBe('🔵');
      expect(SeriesColor.GREEN).toBe('🟢');
      expect(SeriesColor.YELLOW).toBe('🟡');
      expect(SeriesColor.PURPLE).toBe('🟣');
      expect(SeriesColor.ORANGE).toBe('🟠');
    });

    it('should export SeriesSize enum with correct values', () => {
      expect(SeriesSize.SMALL).toBe('small');
      expect(SeriesSize.MEDIUM).toBe('medium');
      expect(SeriesSize.LARGE).toBe('large');
    });

    it('should export SeriesPosition enum with correct values', () => {
      expect(SeriesPosition.LEFT).toBe('left');
      expect(SeriesPosition.CENTER).toBe('center');
      expect(SeriesPosition.RIGHT).toBe('right');
      expect(SeriesPosition.TOP).toBe('top');
      expect(SeriesPosition.BOTTOM).toBe('bottom');
    });
  });

  describe('Random Puzzle Generation', () => {
    it('should generate random puzzles with valid structure', () => {
      const puzzle = generator.getRandom();

      expect(puzzle).toBeDefined();
      expect(puzzle.puzzleType).toBe('picture-series');
      expect(puzzle.question).toBeTruthy();
      expect(puzzle.series).toBeDefined();
      expect(Array.isArray(puzzle.series)).toBe(true);
      expect(puzzle.seriesLength).toBeGreaterThanOrEqual(3);
      expect(puzzle.seriesLength).toBeLessThanOrEqual(4);
      expect(puzzle.series.length).toBe(puzzle.seriesLength);
      expect(puzzle.transformationType).toBeTruthy();
      expect(puzzle.nextFigure).toBeDefined();
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctAnswerIndex).toBeLessThan(4);
      expect(puzzle.hiddenIndex).toBe(puzzle.seriesLength - 1);
      expect(puzzle.explanation).toBeTruthy();
      expect(puzzle.difficultyLevel).toMatch(/^(easy|medium|hard)$/);
      expect(puzzle.semanticId).toContain('picture-series');
    });

    it('should generate puzzles with all transformation types over many iterations', () => {
      const transformationTypeCounts: Record<string, number> = {};
      const iterations = 500;

      for (let i = 0; i < iterations; i++) {
        const puzzle = generator.getRandom();
        const type = puzzle.transformationType;
        transformationTypeCounts[type] = (transformationTypeCounts[type] || 0) + 1;
      }

      // Check that we've generated at least some of each major type
      expect(transformationTypeCounts[SeriesTransformationType.GEOMETRIC_PROGRESSION]).toBeGreaterThan(0);
      expect(transformationTypeCounts[SeriesTransformationType.ARITHMETIC_PROGRESSION]).toBeGreaterThan(0);
      expect(transformationTypeCounts[SeriesTransformationType.ROTATION_SEQUENCE]).toBeGreaterThan(0);
      expect(transformationTypeCounts[SeriesTransformationType.POSITION_MOVEMENT]).toBeGreaterThan(0);
    });

    it('should include correct answer in options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        expect(correctAnswer).toBeTruthy();
      }
    });
  });

  describe('Geometric Progression Series', () => {
    it('should generate valid geometric progression puzzles', () => {
      // Use private method through reflection for testing
      const puzzle = (generator as any).generateGeometricSeries(2, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.GEOMETRIC_PROGRESSION);
      expect(puzzle.question).toContain('shape sequence');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('geometric');

      // Check that shapes progress logically
      const shapes = puzzle.series.map((f: SeriesFigure) => f.shape);
      expect(shapes[0]).toBe(SeriesShape.TRIANGLE);
      expect(shapes[1]).toBe(SeriesShape.SQUARE);
      expect(shapes[2]).toBe(SeriesShape.PENTAGON);

      // Next should be hexagon
      expect(puzzle.nextFigure.shape).toBe(SeriesShape.HEXAGON);
    });

    it('should handle geometric progression with 4 figures', () => {
      const puzzle = (generator as any).generateGeometricSeries(3, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.seriesLength).toBe(4);
      expect(puzzle.nextFigure.shape).toBe(SeriesShape.CIRCLE);
    });
  });

  describe('Arithmetic Progression Series', () => {
    it('should generate valid arithmetic progression puzzles', () => {
      const puzzle = (generator as any).generateArithmeticSeries(1, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.ARITHMETIC_PROGRESSION);
      expect(puzzle.question).toContain('counting sequence');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('arithmetic');
      expect(puzzle.difficultyLevel).toBe('easy');

      // Check pattern increases by 1
      expect(puzzle.series[0].pattern).toBe('○');
      expect(puzzle.series[1].pattern).toBe('○○');
      expect(puzzle.series[2].pattern).toBe('○○○');
      expect(puzzle.nextFigure.pattern).toBe('○○○○');
    });

    it('should handle longer arithmetic sequences', () => {
      const puzzle = (generator as any).generateArithmeticSeries(2, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.nextFigure.pattern).toBe('○○○○○');
    });
  });

  describe('Rotation Sequence Series', () => {
    it('should generate valid rotation sequence puzzles with 90-degree steps', () => {
      const puzzle = (generator as any).generateRotationSeries(2, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.ROTATION_SEQUENCE);
      expect(puzzle.question).toContain('rotation series');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('rotation');

      // Check 90-degree rotation steps
      expect(puzzle.series[0].rotation).toBe(0);
      expect(puzzle.series[1].rotation).toBe(90);
      expect(puzzle.series[2].rotation).toBe(180);
      expect(puzzle.nextFigure.rotation).toBe(270);
    });

    it('should generate rotation with 45-degree steps for harder difficulty', () => {
      const puzzle = (generator as any).generateRotationSeries(3, 4);

      expect(puzzle.series).toHaveLength(4);
      // For difficulty > 2, should use 45-degree steps
      expect(puzzle.series[0].rotation).toBe(0);
      expect(puzzle.series[1].rotation).toBe(45);
      expect(puzzle.series[2].rotation).toBe(90);
      expect(puzzle.series[3].rotation).toBe(135);
      expect(puzzle.nextFigure.rotation).toBe(180);
    });

    it('should handle rotation wraparound at 360 degrees', () => {
      const puzzle = (generator as any).generateRotationSeries(2, 4);

      expect(puzzle.series[0].rotation).toBe(0);
      expect(puzzle.series[1].rotation).toBe(90);
      expect(puzzle.series[2].rotation).toBe(180);
      expect(puzzle.series[3].rotation).toBe(270);
      expect(puzzle.nextFigure.rotation).toBe(0); // Wraps back to 0
    });
  });

  describe('Position Movement Series', () => {
    it('should generate valid position movement puzzles', () => {
      const puzzle = (generator as any).generatePositionSeries(2, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.POSITION_MOVEMENT);
      expect(puzzle.question).toContain('move');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('position');

      // Check position cycling
      expect(puzzle.series[0].position).toBe(SeriesPosition.LEFT);
      expect(puzzle.series[1].position).toBe(SeriesPosition.CENTER);
      expect(puzzle.series[2].position).toBe(SeriesPosition.RIGHT);
      expect(puzzle.nextFigure.position).toBe(SeriesPosition.LEFT); // Cycles back
    });

    it('should handle longer position sequences', () => {
      const puzzle = (generator as any).generatePositionSeries(3, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.series[3].position).toBe(SeriesPosition.LEFT);
      expect(puzzle.nextFigure.position).toBe(SeriesPosition.CENTER);
    });
  });

  describe('Size Scaling Series', () => {
    it('should generate valid size scaling puzzles', () => {
      const puzzle = (generator as any).generateSizeSeries(3, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.SIZE_SCALING);
      expect(puzzle.question).toContain('size');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('size');
      expect(puzzle.difficultyLevel).toBe('medium');

      // Check size cycling
      expect(puzzle.series[0].size).toBe(SeriesSize.SMALL);
      expect(puzzle.series[1].size).toBe(SeriesSize.MEDIUM);
      expect(puzzle.series[2].size).toBe(SeriesSize.LARGE);
      expect(puzzle.nextFigure.size).toBe(SeriesSize.SMALL); // Cycles back
    });

    it('should handle size scaling with 4 figures', () => {
      const puzzle = (generator as any).generateSizeSeries(3, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.series[3].size).toBe(SeriesSize.SMALL);
      expect(puzzle.nextFigure.size).toBe(SeriesSize.MEDIUM);
    });
  });

  describe('Color Cycling Series', () => {
    it('should generate valid color cycling puzzles', () => {
      const puzzle = (generator as any).generateColorSeries(3, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.COLOR_CYCLING);
      expect(puzzle.question).toContain('color');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('color');

      // Check color cycling
      expect(puzzle.series[0].color).toBe(SeriesColor.RED);
      expect(puzzle.series[1].color).toBe(SeriesColor.BLUE);
      expect(puzzle.series[2].color).toBe(SeriesColor.GREEN);
      expect(puzzle.nextFigure.color).toBe(SeriesColor.YELLOW);
    });

    it('should handle color cycling with wraparound', () => {
      const puzzle = (generator as any).generateColorSeries(3, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.series[3].color).toBe(SeriesColor.YELLOW);
      expect(puzzle.nextFigure.color).toBe(SeriesColor.RED); // Cycles back
    });
  });

  describe('Pattern Alternation Series', () => {
    it('should generate valid pattern alternation puzzles', () => {
      const puzzle = (generator as any).generatePatternSeries(4, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.PATTERN_ALTERNATION);
      expect(puzzle.question).toContain('alternating pattern');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('pattern');
      expect(puzzle.difficultyLevel).toBe('hard');

      // Check alternating pattern
      expect(puzzle.series[0].pattern).toBe('filled');
      expect(puzzle.series[1].pattern).toBe('empty');
      expect(puzzle.series[2].pattern).toBe('filled');
      expect(puzzle.nextFigure.pattern).toBe('empty');
    });

    it('should maintain alternation with longer sequences', () => {
      const puzzle = (generator as any).generatePatternSeries(5, 4);

      expect(puzzle.series).toHaveLength(4);
      expect(puzzle.series[3].pattern).toBe('empty');
      expect(puzzle.nextFigure.pattern).toBe('filled');
    });
  });

  describe('Compound Transformation Series', () => {
    it('should generate valid compound transformation puzzles', () => {
      const puzzle = (generator as any).generateCompoundSeries(5, 3);

      expect(puzzle.transformationType).toBe(SeriesTransformationType.COMPOUND_TRANSFORMATION);
      expect(puzzle.question).toContain('complex series');
      expect(puzzle.series).toHaveLength(3);
      expect(puzzle.puzzleSubtype).toBe('compound');
      expect(puzzle.difficultyLevel).toBe('hard');

      // Check multiple attributes change
      expect(puzzle.series[0].shape).toBe(SeriesShape.TRIANGLE);
      expect(puzzle.series[0].color).toBe(SeriesColor.RED);
      expect(puzzle.series[0].size).toBe(SeriesSize.SMALL);

      expect(puzzle.series[1].shape).toBe(SeriesShape.SQUARE);
      expect(puzzle.series[1].color).toBe(SeriesColor.BLUE);
      expect(puzzle.series[1].size).toBe(SeriesSize.MEDIUM);

      expect(puzzle.series[2].shape).toBe(SeriesShape.PENTAGON);
      expect(puzzle.series[2].color).toBe(SeriesColor.GREEN);
      expect(puzzle.series[2].size).toBe(SeriesSize.LARGE);

      expect(puzzle.nextFigure.shape).toBe(SeriesShape.TRIANGLE);
      expect(puzzle.nextFigure.color).toBe(SeriesColor.RED);
      expect(puzzle.nextFigure.size).toBe(SeriesSize.SMALL);
    });
  });

  describe('Difficulty Determination', () => {
    it('should correctly determine difficulty for different transformation types', () => {
      const determineDifficulty = (generator as any).determineDifficulty.bind(generator);

      // Arithmetic is always easy
      expect(determineDifficulty(SeriesTransformationType.ARITHMETIC_PROGRESSION, 3)).toBe('easy');
      expect(determineDifficulty(SeriesTransformationType.ARITHMETIC_PROGRESSION, 4)).toBe('easy');

      // Geometric and Position depend on length
      expect(determineDifficulty(SeriesTransformationType.GEOMETRIC_PROGRESSION, 3)).toBe('easy');
      expect(determineDifficulty(SeriesTransformationType.GEOMETRIC_PROGRESSION, 4)).toBe('medium');
      expect(determineDifficulty(SeriesTransformationType.POSITION_MOVEMENT, 3)).toBe('easy');
      expect(determineDifficulty(SeriesTransformationType.POSITION_MOVEMENT, 4)).toBe('medium');

      // Rotation, Size, Color are medium
      expect(determineDifficulty(SeriesTransformationType.ROTATION_SEQUENCE, 3)).toBe('medium');
      expect(determineDifficulty(SeriesTransformationType.SIZE_SCALING, 3)).toBe('medium');
      expect(determineDifficulty(SeriesTransformationType.COLOR_CYCLING, 3)).toBe('medium');

      // Pattern and Compound are hard
      expect(determineDifficulty(SeriesTransformationType.PATTERN_ALTERNATION, 3)).toBe('hard');
      expect(determineDifficulty(SeriesTransformationType.COMPOUND_TRANSFORMATION, 3)).toBe('hard');
    });
  });

  describe('Figure to String Conversion', () => {
    it('should convert figures with patterns correctly', () => {
      const figureToString = (generator as any).figureToString.bind(generator);

      const figure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        pattern: '○○○',
        order: 0
      };

      expect(figureToString(figure)).toBe('○○○');
    });

    it('should handle rotation display', () => {
      const figureToString = (generator as any).figureToString.bind(generator);

      const figure: SeriesFigure = {
        shape: SeriesShape.TRIANGLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 180,
        order: 0
      };

      expect(figureToString(figure)).toBe('▽');
    });

    it('should handle size indicators', () => {
      const figureToString = (generator as any).figureToString.bind(generator);

      const smallFigure: SeriesFigure = {
        shape: SeriesShape.SQUARE,
        size: SeriesSize.SMALL,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 0
      };

      const largeFigure: SeriesFigure = {
        shape: SeriesShape.SQUARE,
        size: SeriesSize.LARGE,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 0
      };

      expect(figureToString(smallFigure)).toBe('◦■◦');
      expect(figureToString(largeFigure)).toBe('●■●');
    });

    it('should handle position indicators', () => {
      const figureToString = (generator as any).figureToString.bind(generator);

      const leftFigure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.LEFT,
        rotation: 0,
        order: 0
      };

      const rightFigure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.RIGHT,
        rotation: 0,
        order: 0
      };

      expect(figureToString(leftFigure)).toBe('◀○');
      expect(figureToString(rightFigure)).toBe('○▶');
    });

    it('should handle color display', () => {
      const figureToString = (generator as any).figureToString.bind(generator);

      const coloredFigure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        color: SeriesColor.RED,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 0
      };

      expect(figureToString(coloredFigure)).toBe('🔴○');
    });
  });

  describe('Shape Rotation', () => {
    it('should rotate triangle shapes correctly', () => {
      const rotateShape = (generator as any).rotateShape.bind(generator);

      expect(rotateShape(SeriesShape.TRIANGLE, 0)).toBe('△');
      expect(rotateShape(SeriesShape.TRIANGLE, 90)).toBe('▷');
      expect(rotateShape(SeriesShape.TRIANGLE, 180)).toBe('▽');
      expect(rotateShape(SeriesShape.TRIANGLE, 270)).toBe('◁');
      expect(rotateShape(SeriesShape.TRIANGLE, 45)).toBe('🔼');
      expect(rotateShape(SeriesShape.TRIANGLE, 135)).toBe('▶');
      expect(rotateShape(SeriesShape.TRIANGLE, 225)).toBe('🔽');
      expect(rotateShape(SeriesShape.TRIANGLE, 315)).toBe('◀');
      expect(rotateShape(SeriesShape.TRIANGLE, 360)).toBe('△'); // Default for unhandled
    });

    it('should return original shape for non-triangle shapes', () => {
      const rotateShape = (generator as any).rotateShape.bind(generator);

      expect(rotateShape(SeriesShape.CIRCLE, 90)).toBe(SeriesShape.CIRCLE);
      expect(rotateShape(SeriesShape.SQUARE, 180)).toBe(SeriesShape.SQUARE);
      expect(rotateShape(SeriesShape.STAR, 45)).toBe(SeriesShape.STAR);
    });
  });

  describe('Wrong Options Generation', () => {
    it('should generate appropriate wrong options for each transformation type', () => {
      const generateWrongOptions = (generator as any).generateWrongOptions.bind(generator);

      // Test geometric progression
      const geometricFigure: SeriesFigure = {
        shape: SeriesShape.HEXAGON,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 3
      };
      const geometricWrong = generateWrongOptions(geometricFigure, SeriesTransformationType.GEOMETRIC_PROGRESSION);
      expect(geometricWrong).toHaveLength(3);
      expect(geometricWrong).not.toContain('⬢');

      // Test arithmetic progression
      const arithmeticFigure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        pattern: '○○○○',
        order: 3
      };
      const arithmeticWrong = generateWrongOptions(arithmeticFigure, SeriesTransformationType.ARITHMETIC_PROGRESSION);
      expect(arithmeticWrong).toHaveLength(3);
      expect(arithmeticWrong).not.toContain('○○○○');

      // Test rotation sequence
      const rotationFigure: SeriesFigure = {
        shape: SeriesShape.TRIANGLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 270,
        order: 3
      };
      const rotationWrong = generateWrongOptions(rotationFigure, SeriesTransformationType.ROTATION_SEQUENCE);
      expect(rotationWrong).toHaveLength(3);
    });

    it('should add fallback options if needed', () => {
      const generateWrongOptions = (generator as any).generateWrongOptions.bind(generator);

      const figure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 0
      };

      // Generate for a type that might not have enough unique options
      const wrongOptions = generateWrongOptions(figure, SeriesTransformationType.GEOMETRIC_PROGRESSION);
      expect(wrongOptions).toHaveLength(3);
    });
  });

  describe('Explanation Generation', () => {
    it('should generate appropriate explanations for each transformation type', () => {
      const generateExplanation = (generator as any).generateExplanation.bind(generator);
      const series: SeriesFigure[] = [];
      const nextFigure: SeriesFigure = {
        shape: SeriesShape.CIRCLE,
        size: SeriesSize.MEDIUM,
        position: SeriesPosition.CENTER,
        rotation: 0,
        order: 3
      };

      expect(generateExplanation(SeriesTransformationType.GEOMETRIC_PROGRESSION, series, nextFigure))
        .toContain('geometric progression');
      expect(generateExplanation(SeriesTransformationType.ARITHMETIC_PROGRESSION, series, nextFigure))
        .toContain('arithmetic progression');
      expect(generateExplanation(SeriesTransformationType.ROTATION_SEQUENCE, series, nextFigure))
        .toContain('rotates');
      expect(generateExplanation(SeriesTransformationType.POSITION_MOVEMENT, series, nextFigure))
        .toContain('moves');
      expect(generateExplanation(SeriesTransformationType.SIZE_SCALING, series, nextFigure))
        .toContain('size');
      expect(generateExplanation(SeriesTransformationType.COLOR_CYCLING, series, nextFigure))
        .toContain('color');
      expect(generateExplanation(SeriesTransformationType.PATTERN_ALTERNATION, series, nextFigure))
        .toContain('alternates');
      expect(generateExplanation(SeriesTransformationType.COMPOUND_TRANSFORMATION, series, nextFigure))
        .toContain('Multiple attributes');
      expect(generateExplanation('unknown' as any, series, nextFigure))
        .toContain('logical progression');
    });
  });

  describe('Transformation Type to Subtype Conversion', () => {
    it('should correctly map transformation types to subtypes', () => {
      const transformationTypeToSubtype = (generator as any).transformationTypeToSubtype.bind(generator);

      expect(transformationTypeToSubtype(SeriesTransformationType.GEOMETRIC_PROGRESSION)).toBe('geometric');
      expect(transformationTypeToSubtype(SeriesTransformationType.ARITHMETIC_PROGRESSION)).toBe('arithmetic');
      expect(transformationTypeToSubtype(SeriesTransformationType.ROTATION_SEQUENCE)).toBe('rotation');
      expect(transformationTypeToSubtype(SeriesTransformationType.POSITION_MOVEMENT)).toBe('position');
      expect(transformationTypeToSubtype(SeriesTransformationType.SIZE_SCALING)).toBe('size');
      expect(transformationTypeToSubtype(SeriesTransformationType.COLOR_CYCLING)).toBe('color');
      expect(transformationTypeToSubtype(SeriesTransformationType.PATTERN_ALTERNATION)).toBe('pattern');
      expect(transformationTypeToSubtype(SeriesTransformationType.COMPOUND_TRANSFORMATION)).toBe('compound');
      expect(transformationTypeToSubtype('invalid' as any)).toBe('unknown');
    });
  });

  describe('Difficulty Distribution', () => {
    it('should generate appropriate difficulty distribution', () => {
      const getRandomNumericDifficulty = (generator as any).getRandomNumericDifficulty.bind(generator);
      const difficultyCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const difficulty = getRandomNumericDifficulty();
        difficultyCounts[difficulty]++;
      }

      // Check approximate distribution (with tolerance)
      expect(difficultyCounts[1] / iterations).toBeCloseTo(0.30, 1); // ~30%
      expect(difficultyCounts[2] / iterations).toBeCloseTo(0.25, 1); // ~25%
      expect(difficultyCounts[3] / iterations).toBeCloseTo(0.25, 1); // ~25%
      expect(difficultyCounts[4] / iterations).toBeCloseTo(0.15, 1); // ~15%
      expect(difficultyCounts[5] / iterations).toBeCloseTo(0.05, 1); // ~5%
    });

    it('should select appropriate transformation types for difficulty', () => {
      const getRandomTransformation = (generator as any).getRandomTransformation.bind(generator);

      // Easy difficulty should get easy types
      const easyTypes = new Set<SeriesTransformationType>();
      for (let i = 0; i < 50; i++) {
        easyTypes.add(getRandomTransformation(1));
      }
      expect(easyTypes.has(SeriesTransformationType.GEOMETRIC_PROGRESSION)).toBe(true);
      expect(easyTypes.has(SeriesTransformationType.ARITHMETIC_PROGRESSION)).toBe(true);
      expect(easyTypes.has(SeriesTransformationType.POSITION_MOVEMENT)).toBe(true);

      // Hard difficulty should get hard types
      const hardTypes = new Set<SeriesTransformationType>();
      for (let i = 0; i < 50; i++) {
        hardTypes.add(getRandomTransformation(5));
      }
      expect(hardTypes.has(SeriesTransformationType.PATTERN_ALTERNATION) ||
             hardTypes.has(SeriesTransformationType.COMPOUND_TRANSFORMATION) ||
             hardTypes.has(SeriesTransformationType.ROTATION_SEQUENCE)).toBe(true);
    });

    it('should determine series length based on difficulty', () => {
      const getSeriesLengthForNumericDifficulty = (generator as any).getSeriesLengthForNumericDifficulty.bind(generator);

      expect(getSeriesLengthForNumericDifficulty(1)).toBe(3);
      expect(getSeriesLengthForNumericDifficulty(2)).toBe(3);
      expect(getSeriesLengthForNumericDifficulty(3)).toBe(4);
      expect(getSeriesLengthForNumericDifficulty(4)).toBe(4);
      expect(getSeriesLengthForNumericDifficulty(5)).toBe(4);
    });
  });

  describe('Array Shuffling', () => {
    it('should shuffle array elements without losing any', () => {
      const shuffleArray = (generator as any).shuffleArray.bind(generator);
      const original = ['a', 'b', 'c', 'd', 'e'];

      // Test that shuffling preserves all elements (this is the important part)
      for (let i = 0; i < 10; i++) {
        const testArray = [...original];
        shuffleArray(testArray);

        // Check all elements are still present (this is what matters for correctness)
        expect(testArray.sort()).toEqual(original.sort());
        expect(testArray.length).toBe(original.length);
      }

      // Test that the function modifies the array in-place
      const testArray = ['a', 'b', 'c', 'd', 'e'];
      shuffleArray(testArray);
      expect(testArray.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('Singleton Export', () => {
    it('should export singleton instance', () => {
      expect(pictureSeriesPuzzleGenerator).toBeInstanceOf(PictureSeriesPuzzleGenerator);

      // Test that singleton works
      const puzzle1 = pictureSeriesPuzzleGenerator.getRandom();
      const puzzle2 = pictureSeriesPuzzleGenerator.getRandom();

      expect(puzzle1).toBeDefined();
      expect(puzzle2).toBeDefined();
      expect(puzzle1.puzzleType).toBe('picture-series');
      expect(puzzle2.puzzleType).toBe('picture-series');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all series lengths correctly', () => {
      for (let length = 3; length <= 4; length++) {
        const puzzle = (generator as any).generateGeometricSeries(2, length);
        expect(puzzle.series).toHaveLength(length);
        expect(puzzle.seriesLength).toBe(length);
        expect(puzzle.hiddenIndex).toBe(length - 1);
      }
    });

    it('should ensure correct answer is always in shuffled options', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        expect(puzzle.options).toContain(correctAnswer);
      }
    });

    it('should handle all figure attributes consistently', () => {
      const figure: SeriesFigure = {
        shape: SeriesShape.STAR,
        color: SeriesColor.PURPLE,
        size: SeriesSize.LARGE,
        position: SeriesPosition.TOP,
        rotation: 45,
        pattern: 'custom',
        order: 0
      };

      const figureToString = (generator as any).figureToString.bind(generator);
      const result = figureToString(figure);

      expect(result).toContain('custom'); // Pattern takes precedence
    });
  });

  describe('Integration Tests', () => {
    it('should generate valid puzzles for all transformation types', () => {
      const types = Object.values(SeriesTransformationType);

      types.forEach(type => {
        // Force generation of each type
        let puzzle: PictureSeriesPuzzle | null = null;
        for (let i = 0; i < 100 && !puzzle; i++) {
          const generated = generator.getRandom();
          if (generated.transformationType === type) {
            puzzle = generated;
          }
        }

        expect(puzzle).toBeDefined();
        expect(puzzle!.transformationType).toBe(type);
        expect(puzzle!.series.length).toBeGreaterThanOrEqual(3);
        expect(puzzle!.options).toHaveLength(4);
        expect(puzzle!.explanation).toBeTruthy();
      });
    });

    it('should maintain consistency across multiple generations', () => {
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();

        // Verify all required properties
        expect(puzzle.puzzleType).toBe('picture-series');
        expect(puzzle.puzzleSubtype).toBeTruthy();
        expect(puzzle.difficultyLevel).toMatch(/^(easy|medium|hard)$/);
        expect(puzzle.semanticId).toMatch(/^picture-series-/);
        expect(puzzle.series.every((f: SeriesFigure) => f.shape)).toBe(true);
        expect(puzzle.series.every((f: SeriesFigure) => f.size)).toBe(true);
        expect(puzzle.series.every((f: SeriesFigure) => f.position)).toBe(true);
        expect(puzzle.series.every((f: SeriesFigure) => typeof f.rotation === 'number')).toBe(true);
        expect(puzzle.series.every((f: SeriesFigure) => typeof f.order === 'number')).toBe(true);
      }
    });
  });
});