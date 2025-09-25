import React, { useContext } from 'react';
import { render } from '@testing-library/react';
import { 
  levelBackgrounds, 
  levelCellBackgrounds, 
  LevelColorContext 
} from '../../src/components/ui/levelColor';

describe('levelColorContext', () => {
  describe('levelBackgrounds', () => {
    it('should have 5 level backgrounds', () => {
      expect(levelBackgrounds).toHaveLength(5);
    });

    it('should have valid hex color values', () => {
      levelBackgrounds.forEach((color: string) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should have expected level colors', () => {
      expect(levelBackgrounds[0]).toBe('#1A202C'); // Seeker
      expect(levelBackgrounds[1]).toBe('#1E90FF'); // Learner
      expect(levelBackgrounds[2]).toBe('#FFD700'); // Thinker
      expect(levelBackgrounds[3]).toBe('#FF69B4'); // Creator
      expect(levelBackgrounds[4]).toBe('#32CD32'); // Visionary
    });
  });

  describe('levelCellBackgrounds', () => {
    it('should have 5 cell background colors', () => {
      expect(levelCellBackgrounds).toHaveLength(5);
    });

    it('should have valid rgba color values', () => {
      levelCellBackgrounds.forEach((color: string) => {
        expect(color).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
      });
    });

    it('should have matching number of backgrounds and cell backgrounds', () => {
      expect(levelBackgrounds.length).toBe(levelCellBackgrounds.length);
    });

    it('should have expected cell colors with transparency', () => {
      expect(levelCellBackgrounds[0]).toBe('rgba(26,32,44,0.7)'); // Seeker
      expect(levelCellBackgrounds[1]).toBe('rgba(30,144,255,0.25)'); // Learner
      expect(levelCellBackgrounds[2]).toBe('rgba(255,215,0,0.18)'); // Thinker
      expect(levelCellBackgrounds[3]).toBe('rgba(255,105,180,0.18)'); // Creator
      expect(levelCellBackgrounds[4]).toBe('rgba(50,205,50,0.18)'); // Visionary
    });

    it('should have alpha values less than 1 for transparency', () => {
      levelCellBackgrounds.forEach((color: string) => {
        const alphaMatch = color.match(/rgba\(\d+,\d+,\d+,([\d.]+)\)/);
        expect(alphaMatch).not.toBeNull();
        const alpha = parseFloat(alphaMatch![1]);
        expect(alpha).toBeLessThan(1);
        expect(alpha).toBeGreaterThan(0);
      });
    });
  });

  describe('LevelColorContext', () => {
    it('should have default values', () => {
      const TestComponent = () => {
        const context = useContext(LevelColorContext) as { bgColor: string; cellColor: string; levelIndex: number };
        return (
          <div data-testid="context-values">
            <span data-testid="bg-color">{context.bgColor}</span>
            <span data-testid="cell-color">{context.cellColor}</span>
            <span data-testid="level-index">{context.levelIndex}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('bg-color').textContent).toBe('#1A202C');
      expect(getByTestId('cell-color').textContent).toBe('rgba(26,32,44,0.7)');
      expect(getByTestId('level-index').textContent).toBe('0');
    });

    it('should allow context value override', () => {
      const customContext = {
        bgColor: levelBackgrounds[2], // Thinker
        cellColor: levelCellBackgrounds[2],
        levelIndex: 2,
      };

      const TestComponent = () => {
        const context = useContext(LevelColorContext) as { bgColor: string; cellColor: string; levelIndex: number };
        return (
          <div data-testid="context-values">
            <span data-testid="bg-color">{context.bgColor}</span>
            <span data-testid="cell-color">{context.cellColor}</span>
            <span data-testid="level-index">{context.levelIndex}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <LevelColorContext.Provider value={customContext}>
          <TestComponent />
        </LevelColorContext.Provider>
      );

      expect(getByTestId('bg-color').textContent).toBe('#FFD700');
      expect(getByTestId('cell-color').textContent).toBe('rgba(255,215,0,0.18)');
      expect(getByTestId('level-index').textContent).toBe('2');
    });

    it('should default to level 0 values', () => {
      const TestComponent = () => {
        const { bgColor, cellColor, levelIndex } = useContext(LevelColorContext);
        
        // Verify defaults match level 0
        expect(bgColor).toBe(levelBackgrounds[0]);
        expect(cellColor).toBe(levelCellBackgrounds[0]);
        expect(levelIndex).toBe(0);
        
        return <div />;
      };

      render(<TestComponent />);
    });
  });

  describe('Color coordination', () => {
    it('should have corresponding RGB values in backgrounds and cell backgrounds', () => {
      // Check that cell background rgba values correspond to hex backgrounds
      expect(levelCellBackgrounds[0]).toContain('26,32,44'); // #1A202C
      expect(levelCellBackgrounds[1]).toContain('30,144,255'); // #1E90FF
      expect(levelCellBackgrounds[2]).toContain('255,215,0'); // #FFD700
      expect(levelCellBackgrounds[3]).toContain('255,105,180'); // #FF69B4
      expect(levelCellBackgrounds[4]).toContain('50,205,50'); // #32CD32
    });
  });
});