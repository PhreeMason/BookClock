import { createProgressUpdateSchema } from '../progressUpdateSchema';

describe('Progress Validation Manual Tests', () => {
  const schema = createProgressUpdateSchema(300, 'physical');

  describe('valid inputs should parse correctly', () => {
    it('parses string numbers correctly', () => {
      const result = schema.parse({ currentProgress: '150' });
      expect(result.currentProgress).toBe(150);
    });

    it('parses actual numbers correctly', () => {
      const result = schema.parse({ currentProgress: 200 });
      expect(result.currentProgress).toBe(200);
    });

    it('parses zero correctly', () => {
      const result = schema.parse({ currentProgress: '0' });
      expect(result.currentProgress).toBe(0);
    });

    it('parses maximum value correctly', () => {
      const result = schema.parse({ currentProgress: '300' });
      expect(result.currentProgress).toBe(300);
    });
  });

  describe('invalid inputs should provide user-friendly error messages', () => {
    it('provides clear message for empty input', () => {
      expect(() => schema.parse({ currentProgress: '' }))
        .toThrow('Please enter your current progress');
    });

    it('provides clear message for invalid text', () => {
      expect(() => schema.parse({ currentProgress: 'abc' }))
        .toThrow('Please enter a valid number');
    });

    it('provides clear message for negative numbers', () => {
      expect(() => schema.parse({ currentProgress: '-10' }))
        .toThrow('Progress cannot be negative');
    });

    it('provides clear message when exceeding total', () => {
      expect(() => schema.parse({ currentProgress: '400' }))
        .toThrow('Progress cannot exceed 300 pages');
    });

    it('provides clear message for decimal numbers', () => {
      expect(() => schema.parse({ currentProgress: '150.5' }))
        .toThrow('Progress must be a whole number');
    });

    it('provides clear message for undefined', () => {
      expect(() => schema.parse({ currentProgress: undefined }))
        .toThrow('Please enter your current progress');
    });

    it('provides clear message for null', () => {
      expect(() => schema.parse({ currentProgress: null }))
        .toThrow('Please enter your current progress');
    });

    it('provides clear message for NaN', () => {
      expect(() => schema.parse({ currentProgress: NaN }))
        .toThrow('Please enter a valid number');
    });
  });

  describe('format-specific error messages', () => {
    it('shows correct unit for audio format', () => {
      const audioSchema = createProgressUpdateSchema(120, 'audio');
      expect(() => audioSchema.parse({ currentProgress: '150' }))
        .toThrow('Progress cannot exceed 120 minutes');
    });

    it('shows correct unit for ebook format', () => {
      const ebookSchema = createProgressUpdateSchema(200, 'ebook');
      expect(() => ebookSchema.parse({ currentProgress: '250' }))
        .toThrow('Progress cannot exceed 200 pages');
    });
  });
});