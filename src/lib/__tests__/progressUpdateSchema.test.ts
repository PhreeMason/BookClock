import { createProgressUpdateSchema } from '../progressUpdateSchema';

describe('progressUpdateSchema', () => {
  describe('createProgressUpdateSchema', () => {
    const schema = createProgressUpdateSchema(300, 'physical');
    const audioSchema = createProgressUpdateSchema(120, 'audio');

    describe('valid inputs', () => {
      it('accepts valid number strings', () => {
        const result = schema.safeParse({ currentProgress: '150' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentProgress).toBe(150);
        }
      });

      it('accepts valid numbers', () => {
        const result = schema.safeParse({ currentProgress: 150 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentProgress).toBe(150);
        }
      });

      it('accepts zero progress', () => {
        const result = schema.safeParse({ currentProgress: '0' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentProgress).toBe(0);
        }
      });

      it('accepts maximum progress', () => {
        const result = schema.safeParse({ currentProgress: '300' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentProgress).toBe(300);
        }
      });
    });

    describe('empty and invalid inputs', () => {
      it('rejects empty string with user-friendly message', () => {
        expect(() => schema.parse({ currentProgress: '' })).toThrow('Please enter your current progress');
      });

      it('rejects undefined with user-friendly message', () => {
        expect(() => schema.parse({ currentProgress: undefined })).toThrow('Please enter your current progress');
      });

      it('rejects null with user-friendly message', () => {
        expect(() => schema.parse({ currentProgress: null })).toThrow('Please enter your current progress');
      });

      it('rejects invalid text with user-friendly message', () => {
        expect(() => schema.parse({ currentProgress: 'abc' })).toThrow('Please enter a valid number');
      });

      it('rejects NaN with user-friendly message', () => {
        expect(() => schema.parse({ currentProgress: NaN })).toThrow('Please enter a valid number');
      });
    });

    describe('boundary validation', () => {
      it('rejects negative progress', () => {
        const result = schema.safeParse({ currentProgress: '-10' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot be negative');
        }
      });

      it('rejects progress exceeding total for physical books', () => {
        const result = schema.safeParse({ currentProgress: '350' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 300 pages');
        }
      });

      it('rejects progress exceeding total for audio books', () => {
        const result = audioSchema.safeParse({ currentProgress: '150' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 120 minutes');
        }
      });

      it('rejects decimal numbers', () => {
        const result = schema.safeParse({ currentProgress: '150.5' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress must be a whole number');
        }
      });
    });

    describe('edge cases', () => {
      it('handles whitespace-only strings', () => {
        expect(() => schema.parse({ currentProgress: '   ' })).toThrow('Please enter your current progress');
      });

      it('handles numeric strings with whitespace', () => {
        const result = schema.safeParse({ currentProgress: '  150  ' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentProgress).toBe(150);
        }
      });

      it('handles very large numbers', () => {
        const result = schema.safeParse({ currentProgress: '999999999' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 300 pages');
        }
      });
    });

    describe('format-specific messages', () => {
      it('shows correct unit name for physical books', () => {
        const physicalSchema = createProgressUpdateSchema(200, 'physical');
        const result = physicalSchema.safeParse({ currentProgress: '250' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 200 pages');
        }
      });

      it('shows correct unit name for ebooks', () => {
        const ebookSchema = createProgressUpdateSchema(200, 'ebook');
        const result = ebookSchema.safeParse({ currentProgress: '250' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 200 pages');
        }
      });

      it('shows correct unit name for audio books', () => {
        const result = audioSchema.safeParse({ currentProgress: '150' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Progress cannot exceed 120 minutes');
        }
      });
    });
  });
});