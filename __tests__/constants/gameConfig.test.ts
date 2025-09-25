import { GAME_CONFIG, LEVELS, THEME } from '../../src/constants/gameConfig';

describe('gameConfig', () => {
  describe('GAME_CONFIG', () => {
    it('should have all required game configuration properties', () => {
      expect(GAME_CONFIG).toHaveProperty('LOOP_SECONDS');
      expect(GAME_CONFIG).toHaveProperty('POWER_SURGE_THRESHOLD');
      expect(GAME_CONFIG).toHaveProperty('AUTO_ADVANCE_DELAY');
    });

    it('should have valid numeric values', () => {
      expect(typeof GAME_CONFIG.LOOP_SECONDS).toBe('number');
      expect(typeof GAME_CONFIG.POWER_SURGE_THRESHOLD).toBe('number');
      expect(typeof GAME_CONFIG.AUTO_ADVANCE_DELAY).toBe('number');
      
      expect(GAME_CONFIG.LOOP_SECONDS).toBeGreaterThan(0);
      expect(GAME_CONFIG.POWER_SURGE_THRESHOLD).toBeGreaterThan(0);
      expect(GAME_CONFIG.AUTO_ADVANCE_DELAY).toBeGreaterThan(0);
    });

    it('should have expected default values', () => {
      expect(GAME_CONFIG.LOOP_SECONDS).toBe(60);
      expect(GAME_CONFIG.POWER_SURGE_THRESHOLD).toBe(5);
      expect(GAME_CONFIG.AUTO_ADVANCE_DELAY).toBe(1200);
    });
  });

  describe('LEVELS', () => {
    it('should be an array of level objects', () => {
      expect(Array.isArray(LEVELS)).toBe(true);
      expect(LEVELS.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each level', () => {
      LEVELS.forEach((level, index) => {
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('threshold');
        expect(level).toHaveProperty('backgroundColor');
        expect(level).toHaveProperty('description');

        expect(typeof level.name).toBe('string');
        expect(typeof level.threshold).toBe('number');
        expect(typeof level.backgroundColor).toBe('string');
        expect(typeof level.description).toBe('string');
      });
    });

    it('should have levels in ascending threshold order', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].threshold).toBeGreaterThan(LEVELS[i - 1].threshold);
      }
    });

    it('should have valid hex color values for backgrounds', () => {
      LEVELS.forEach(level => {
        expect(level.backgroundColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should have unique level names', () => {
      const names = LEVELS.map(level => level.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have unique threshold values', () => {
      const thresholds = LEVELS.map(level => level.threshold);
      const uniqueThresholds = new Set(thresholds);
      expect(uniqueThresholds.size).toBe(thresholds.length);
    });

    it('should start with threshold 0', () => {
      expect(LEVELS[0].threshold).toBe(0);
    });

    it('should have expected level progression', () => {
      expect(LEVELS[0].name).toBe('Seeker');
      expect(LEVELS[1].name).toBe('Learner');
      expect(LEVELS[2].name).toBe('Thinker');
      expect(LEVELS[3].name).toBe('Creator');
      expect(LEVELS[4].name).toBe('Visionary');
    });
  });

  describe('THEME', () => {
    it('should have all main theme categories', () => {
      expect(THEME).toHaveProperty('colors');
      expect(THEME).toHaveProperty('spacing');
      expect(THEME).toHaveProperty('borderRadius');
      expect(THEME).toHaveProperty('fontSize');
    });

    describe('colors', () => {
      it('should have primary color categories', () => {
        expect(THEME.colors).toHaveProperty('primary');
        expect(THEME.colors).toHaveProperty('secondary');
        expect(THEME.colors).toHaveProperty('success');
        expect(THEME.colors).toHaveProperty('error');
        expect(THEME.colors).toHaveProperty('warning');
      });

      it('should have nested color objects', () => {
        expect(THEME.colors).toHaveProperty('background');
        expect(THEME.colors).toHaveProperty('text');
        expect(THEME.colors).toHaveProperty('flash');
        
        expect(typeof THEME.colors.background).toBe('object');
        expect(typeof THEME.colors.text).toBe('object');
        expect(typeof THEME.colors.flash).toBe('object');
      });

      it('should have valid hex color values', () => {
        const flatColors = [
          THEME.colors.primary,
          THEME.colors.secondary,
          THEME.colors.success,
          THEME.colors.error,
          THEME.colors.warning,
          ...Object.values(THEME.colors.background),
          ...Object.values(THEME.colors.text),
        ].filter(color => typeof color === 'string');

        flatColors.forEach(color => {
          expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
        });
      });

      it('should have flash opacity as a number', () => {
        expect(typeof THEME.colors.flash.opacity).toBe('number');
        expect(THEME.colors.flash.opacity).toBeGreaterThan(0);
        expect(THEME.colors.flash.opacity).toBeLessThanOrEqual(1);
      });
    });

    describe('spacing', () => {
      it('should have all spacing sizes', () => {
        expect(THEME.spacing).toHaveProperty('xs');
        expect(THEME.spacing).toHaveProperty('sm');
        expect(THEME.spacing).toHaveProperty('md');
        expect(THEME.spacing).toHaveProperty('lg');
        expect(THEME.spacing).toHaveProperty('xl');
      });

      it('should have numeric values in ascending order', () => {
        const spacingValues = [
          THEME.spacing.xs,
          THEME.spacing.sm,
          THEME.spacing.md,
          THEME.spacing.lg,
          THEME.spacing.xl
        ];

        spacingValues.forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThan(0);
        });

        for (let i = 1; i < spacingValues.length; i++) {
          expect(spacingValues[i]).toBeGreaterThan(spacingValues[i - 1]);
        }
      });
    });

    describe('borderRadius', () => {
      it('should have all border radius sizes', () => {
        expect(THEME.borderRadius).toHaveProperty('sm');
        expect(THEME.borderRadius).toHaveProperty('md');
        expect(THEME.borderRadius).toHaveProperty('lg');
        expect(THEME.borderRadius).toHaveProperty('full');
      });

      it('should have numeric values', () => {
        Object.values(THEME.borderRadius).forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThan(0);
        });
      });

      it('should have full as the largest value', () => {
        expect(THEME.borderRadius.full).toBe(999);
        expect(THEME.borderRadius.full).toBeGreaterThan(THEME.borderRadius.lg);
      });
    });

    describe('fontSize', () => {
      it('should have all font sizes', () => {
        expect(THEME.fontSize).toHaveProperty('sm');
        expect(THEME.fontSize).toHaveProperty('md');
        expect(THEME.fontSize).toHaveProperty('lg');
        expect(THEME.fontSize).toHaveProperty('xl');
        expect(THEME.fontSize).toHaveProperty('xxl');
        expect(THEME.fontSize).toHaveProperty('xxxl');
      });

      it('should have numeric values in ascending order', () => {
        const fontSizes = [
          THEME.fontSize.sm,
          THEME.fontSize.md,
          THEME.fontSize.lg,
          THEME.fontSize.xl,
          THEME.fontSize.xxl,
          THEME.fontSize.xxxl
        ];

        fontSizes.forEach(size => {
          expect(typeof size).toBe('number');
          expect(size).toBeGreaterThan(0);
        });

        for (let i = 1; i < fontSizes.length; i++) {
          expect(fontSizes[i]).toBeGreaterThan(fontSizes[i - 1]);
        }
      });
    });
  });
});