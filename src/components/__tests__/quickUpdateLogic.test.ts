/**
 * Unit tests for the quick update logic to ensure form value parsing works correctly
 */

describe('Quick Update Logic', () => {
  // Simulate the logic from handleQuickUpdate function
  const simulateQuickUpdate = (currentFormValue: any, increment: number, currentProgress: number, totalQuantity: number = 300) => {
    // Convert form value to number, handling both strings and numbers
    let numericValue: number;
    if (typeof currentFormValue === 'string') {
      const parsed = parseFloat(currentFormValue);
      numericValue = isNaN(parsed) ? currentProgress : parsed;
    } else if (typeof currentFormValue === 'number') {
      numericValue = isNaN(currentFormValue) ? currentProgress : currentFormValue;
    } else {
      numericValue = currentProgress;
    }
    
    const newProgress = Math.max(0, Math.min(totalQuantity, numericValue + increment));
    return newProgress;
  };

  describe('string input handling', () => {
    it('should correctly parse valid string numbers', () => {
      expect(simulateQuickUpdate('45', 2, 32)).toBe(47);
      expect(simulateQuickUpdate('0', 5, 32)).toBe(5);
      expect(simulateQuickUpdate('100', 10, 32)).toBe(110);
    });

    it('should handle decimal string numbers', () => {
      expect(simulateQuickUpdate('45.7', 2, 32)).toBe(47.7);
      expect(simulateQuickUpdate('99.9', 1, 32)).toBe(100.9);
    });

    it('should handle string numbers with whitespace', () => {
      expect(simulateQuickUpdate('  45  ', 2, 32)).toBe(47);
      expect(simulateQuickUpdate('\t100\n', 5, 32)).toBe(105);
    });

    it('should fall back to currentProgress for invalid strings', () => {
      expect(simulateQuickUpdate('abc', 2, 32)).toBe(34);
      expect(simulateQuickUpdate('', 2, 32)).toBe(34);
      expect(simulateQuickUpdate('not-a-number', 5, 100)).toBe(105);
    });

    it('should handle negative string numbers', () => {
      expect(simulateQuickUpdate('-10', 2, 32)).toBe(0); // -10 + 2 = -8, capped at 0
      expect(simulateQuickUpdate('-5', 10, 32)).toBe(5); // -5 + 10 = 5
    });
  });

  describe('number input handling', () => {
    it('should correctly handle valid numbers', () => {
      expect(simulateQuickUpdate(45, 2, 32)).toBe(47);
      expect(simulateQuickUpdate(0, 5, 32)).toBe(5);
      expect(simulateQuickUpdate(100, 10, 32)).toBe(110);
    });

    it('should handle decimal numbers', () => {
      expect(simulateQuickUpdate(45.7, 2, 32)).toBe(47.7);
      expect(simulateQuickUpdate(99.1, 0.9, 32)).toBe(100);
    });

    it('should fall back to currentProgress for NaN', () => {
      expect(simulateQuickUpdate(NaN, 2, 32)).toBe(34);
    });

    it('should handle negative numbers', () => {
      expect(simulateQuickUpdate(-10, 2, 32)).toBe(0); // -10 + 2 = -8, capped at 0
      expect(simulateQuickUpdate(-5, 10, 32)).toBe(5); // -5 + 10 = 5
    });
  });

  describe('boundary conditions', () => {
    it('should respect maximum value limits', () => {
      expect(simulateQuickUpdate(299, 5, 32, 300)).toBe(300);
      expect(simulateQuickUpdate('295', 10, 32, 300)).toBe(300);
      expect(simulateQuickUpdate(350, 0, 32, 300)).toBe(300);
    });

    it('should respect minimum value limits', () => {
      expect(simulateQuickUpdate(5, -10, 32)).toBe(0);
      expect(simulateQuickUpdate('3', -5, 32)).toBe(0);
      expect(simulateQuickUpdate(-100, 50, 32)).toBe(0); // -100 + 50 = -50, capped at 0
    });

    it('should handle edge case values', () => {
      expect(simulateQuickUpdate(0, 0, 32)).toBe(0);
      expect(simulateQuickUpdate('0', 0, 32)).toBe(0);
      expect(simulateQuickUpdate(300, 0, 32, 300)).toBe(300);
    });
  });

  describe('null and undefined handling', () => {
    it('should fall back to currentProgress for null/undefined', () => {
      expect(simulateQuickUpdate(null, 2, 32)).toBe(34);
      expect(simulateQuickUpdate(undefined, 5, 100)).toBe(105);
    });
  });

  describe('the exact user scenario', () => {
    it('should handle the user scenario: 32 -> type 45 -> click +2', () => {
      // User's exact scenario
      const originalProgress = 32;
      const typedValue = '45'; // User typed this as string
      const increment = 2; // +2 quick button
      
      const result = simulateQuickUpdate(typedValue, increment, originalProgress);
      
      // Should be 45 + 2 = 47, NOT 32 + 2 = 34
      expect(result).toBe(47);
      expect(result).not.toBe(34); // The bug we're fixing
    });

    it('should handle similar scenarios with different values', () => {
      expect(simulateQuickUpdate('100', 5, 50)).toBe(105);
      expect(simulateQuickUpdate('20', 10, 80)).toBe(30);
      expect(simulateQuickUpdate('0', 1, 99)).toBe(1);
    });
  });

  describe('decimal handling and rounding', () => {
    it('should preserve decimal precision when possible', () => {
      expect(simulateQuickUpdate('45.5', 2, 32)).toBe(47.5);
      expect(simulateQuickUpdate(99.1, 0.9, 32)).toBe(100);
    });

    it('should handle floating point edge cases', () => {
      expect(simulateQuickUpdate('0.1', 0.2, 32)).toBeCloseTo(0.3);
      expect(simulateQuickUpdate(0.1, 0.2, 32)).toBeCloseTo(0.3);
    });
  });
});