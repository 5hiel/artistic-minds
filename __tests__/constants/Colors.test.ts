import { Colors } from '../../src/constants/Colors';

describe('Colors', () => {
  describe('Structure', () => {
    it('should have light and dark color schemes', () => {
      expect(Colors).toHaveProperty('light');
      expect(Colors).toHaveProperty('dark');
      expect(typeof Colors.light).toBe('object');
      expect(typeof Colors.dark).toBe('object');
    });

    it('should have all required color properties in light mode', () => {
      const expectedColors = ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'];
      expectedColors.forEach(color => {
        expect(Colors.light).toHaveProperty(color);
        expect(typeof Colors.light[color as keyof typeof Colors.light]).toBe('string');
      });
    });

    it('should have all required color properties in dark mode', () => {
      const expectedColors = ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'];
      expectedColors.forEach(color => {
        expect(Colors.dark).toHaveProperty(color);
        expect(typeof Colors.dark[color as keyof typeof Colors.dark]).toBe('string');
      });
    });

    it('should have matching properties in both light and dark modes', () => {
      const lightKeys = Object.keys(Colors.light).sort();
      const darkKeys = Object.keys(Colors.dark).sort();
      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe('Color values', () => {
    it('should have valid hex color values in light mode', () => {
      Object.values(Colors.light).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      });
    });

    it('should have valid hex color values in dark mode', () => {
      Object.values(Colors.dark).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      });
    });

    it('should have different values for light and dark modes (at least some)', () => {
      // Not all colors need to be different, but text/background typically are
      expect(Colors.light.text).not.toBe(Colors.dark.text);
      expect(Colors.light.background).not.toBe(Colors.dark.background);
    });
  });

  describe('Specific color values', () => {
    it('should have expected light mode colors', () => {
      expect(Colors.light.text).toBe('#11181C');
      expect(Colors.light.background).toBe('#fff');
      expect(Colors.light.tint).toBe('#0a7ea4');
      expect(Colors.light.icon).toBe('#687076');
      expect(Colors.light.tabIconDefault).toBe('#687076');
      expect(Colors.light.tabIconSelected).toBe('#0a7ea4');
    });

    it('should have expected dark mode colors', () => {
      expect(Colors.dark.text).toBe('#ECEDEE');
      expect(Colors.dark.background).toBe('#151718');
      expect(Colors.dark.tint).toBe('#fff');
      expect(Colors.dark.icon).toBe('#9BA1A6');
      expect(Colors.dark.tabIconDefault).toBe('#9BA1A6');
      expect(Colors.dark.tabIconSelected).toBe('#fff');
    });

    it('should have consistent tint colors for tabs', () => {
      expect(Colors.light.tabIconSelected).toBe(Colors.light.tint);
      expect(Colors.dark.tabIconSelected).toBe(Colors.dark.tint);
    });
  });
});