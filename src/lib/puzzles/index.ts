/**
 * All Puzzle Types
 *
 * Unified exports for all puzzle categories with namespace resolution
 */

// Base puzzle system - import specific types to avoid conflicts
export { BasePuzzle } from '../game/basePuzzle';
export { AnyPuzzle, infinitePuzzleGenerator as generateInfinitePuzzle } from '../game/puzzleGenerator';

// Cognitive puzzles
export {
  FigureClassificationPuzzle,
  FigureElement as CognitiveFigureElement,
  figureClassificationPuzzleGenerator,
  FollowingDirectionsPuzzle,
  followingDirectionsPuzzleGenerator,
  PaperFoldingPuzzle,
  paperFoldingPuzzleGenerator
} from './cognitive';

// Reasoning puzzles
export {
  PatternPuzzle,
  patternPuzzleGenerator,
  SerialReasoningPuzzle,
  serialReasoningPuzzleGenerator,
  AnalogyPuzzle,
  analogyPuzzleGenerator,
  TransformationPuzzle,
  TransformationType as ReasoningTransformationType,
  transformationPuzzleGenerator
} from './reasoning';

// Numerical puzzles
export {
  NumberSeriesPuzzle,
  numberSeriesPuzzleGenerator,
  AlgebraicReasoningPuzzle,
  algebraicReasoningPuzzleGenerator,
  NumberGridPuzzle,
  numberGridPuzzleGenerator,
  NumberAnalogyPuzzle,
  numberAnalogyPuzzleGenerator
} from './numerical';

// Visual puzzles
export {
  SequentialFiguresPuzzle,
  FigureElement as VisualFigureElement,
  TransformationType as VisualTransformationType,
  sequentialFiguresPuzzleGenerator,
  PictureSeriesPuzzle,
  pictureSeriesPuzzleGenerator
} from './visual';