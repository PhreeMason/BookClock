import { DeadlineFormData, deadlineFormSchema } from '../deadlineFormSchema';

describe('deadlineFormSchema', () => {
  // Set up fake timers for consistent date testing
  beforeEach(() => {
    jest.useFakeTimers();
    // Set a fixed date: January 15, 2025
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validFormData: DeadlineFormData = {
    bookTitle: 'Test Book',
    bookAuthor: 'Test Author',
    format: 'physical',
    source: 'personal',
    deadline: new Date('2025-02-15T12:00:00Z'), // Future date relative to mocked time
    totalQuantity: 300,
    totalMinutes: undefined,
    currentMinutes: undefined,
    currentProgress: 0,
    flexibility: 'flexible'
  };

  describe('bookTitle validation', () => {
    it('should validate required book title', () => {
      const data = { ...validFormData, bookTitle: 'Valid Title' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty book title', () => {
      const data = { ...validFormData, bookTitle: '' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Book title is required');
      }
    });

    it('should reject missing book title', () => {
      const { bookTitle, ...dataWithoutTitle } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });
  });

  describe('bookAuthor validation', () => {
    it('should accept valid book author', () => {
      const data = { ...validFormData, bookAuthor: 'John Doe' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty book author', () => {
      const data = { ...validFormData, bookAuthor: '' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept undefined book author', () => {
      const { bookAuthor, ...dataWithoutAuthor } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutAuthor);
      expect(result.success).toBe(true);
    });
  });

  describe('format validation', () => {
    it('should accept valid formats', () => {
      const formats = ['physical', 'ebook', 'audio'] as const;
      formats.forEach(format => {
        const data = { ...validFormData, format };
        const result = deadlineFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid format', () => {
      const data = { ...validFormData, format: 'invalid' as any };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a format');
      }
    });

    it('should reject missing format', () => {
      const { format, ...dataWithoutFormat } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutFormat);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a format');
      }
    });
  });

  describe('source validation', () => {
    it('should accept valid sources', () => {
      const sources = ['library', 'arc', 'personal'] as const;
      sources.forEach(source => {
        const data = { ...validFormData, source };
        const result = deadlineFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid source', () => {
      const data = { ...validFormData, source: 'invalid' as any };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a source');
      }
    });

    it('should reject missing source', () => {
      const { source, ...dataWithoutSource } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutSource);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a source');
      }
    });
  });

  describe('deadline validation', () => {
    it('should accept future date', () => {
      const futureDate = new Date('2025-02-15T12:00:00Z'); // Future relative to mocked time
      const data = { ...validFormData, deadline: futureDate };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject past date', () => {
      const pastDate = new Date('2025-01-10T12:00:00Z'); // Past relative to mocked time
      const data = { ...validFormData, deadline: pastDate };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Deadline must be in the future');
      }
    });

    it('should reject current date', () => {
      const currentDate = new Date('2025-01-15T12:00:00Z'); // Same as mocked time
      const data = { ...validFormData, deadline: currentDate };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Deadline must be in the future');
      }
    });

    it('should reject missing deadline', () => {
      const { deadline, ...dataWithoutDeadline } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutDeadline);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Deadline is required');
      }
    });
  });

  describe('totalQuantity validation', () => {
    it('should accept positive integers', () => {
      const data = { ...validFormData, totalQuantity: 100 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept string numbers', () => {
      const data = { ...validFormData, totalQuantity: '200' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalQuantity).toBe(200);
      }
    });

    it('should reject zero', () => {
      const data = { ...validFormData, totalQuantity: 0 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Total must be a positive number');
      }
    });

    it('should reject negative numbers', () => {
      const data = { ...validFormData, totalQuantity: -10 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Total must be a positive number');
      }
    });

    it('should reject decimals', () => {
      const data = { ...validFormData, totalQuantity: 100.5 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Expected integer, received float');
      }
    });
  });

  describe('totalMinutes validation', () => {
    it('should accept positive integers', () => {
      const data = { ...validFormData, totalMinutes: 30 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept string numbers', () => {
      const data = { ...validFormData, totalMinutes: '45' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalMinutes).toBe(45);
      }
    });

    it('should accept undefined', () => {
      const { totalMinutes, ...dataWithoutMinutes } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutMinutes);
      expect(result.success).toBe(true);
    });

    it('should reject zero', () => {
      const data = { ...validFormData, totalMinutes: 0 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Minutes must be a positive number');
      }
    });

    it('should reject negative numbers', () => {
      const data = { ...validFormData, totalMinutes: -10 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Minutes must be a positive number');
      }
    });
  });

  describe('currentMinutes validation', () => {
    it('should accept positive integers', () => {
      const data = { ...validFormData, currentMinutes: 15 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept string numbers', () => {
      const data = { ...validFormData, currentMinutes: '20' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentMinutes).toBe(20);
      }
    });

    it('should accept undefined', () => {
      const { currentMinutes, ...dataWithoutMinutes } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutMinutes);
      expect(result.success).toBe(true);
    });

    it('should reject zero', () => {
      const data = { ...validFormData, currentMinutes: 0 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Minutes must be a positive number');
      }
    });

    it('should reject negative numbers', () => {
      const data = { ...validFormData, currentMinutes: -10 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Minutes must be a positive number');
      }
    });
  });

  describe('currentProgress validation', () => {
    it('should accept non-negative integers', () => {
      const data = { ...validFormData, currentProgress: 50 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept zero', () => {
      const data = { ...validFormData, currentProgress: 0 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept string numbers', () => {
      const data = { ...validFormData, currentProgress: '75' };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentProgress).toBe(75);
      }
    });

    it('should accept undefined', () => {
      const { currentProgress, ...dataWithoutProgress } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutProgress);
      expect(result.success).toBe(true);
    });

    it('should reject negative numbers', () => {
      const data = { ...validFormData, currentProgress: -10 };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Number must be greater than or equal to 0');
      }
    });
  });

  describe('flexibility validation', () => {
    it('should accept valid flexibility options', () => {
      const flexibilities = ['flexible', 'strict'] as const;
      flexibilities.forEach(flexibility => {
        const data = { ...validFormData, flexibility };
        const result = deadlineFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid flexibility', () => {
      const data = { ...validFormData, flexibility: 'invalid' as any };
      const result = deadlineFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select deadline flexibility');
      }
    });

    it('should reject missing flexibility', () => {
      const { flexibility, ...dataWithoutFlexibility } = validFormData;
      const result = deadlineFormSchema.safeParse(dataWithoutFlexibility);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select deadline flexibility');
      }
    });
  });

  describe('complete form validation', () => {
    it('should validate complete valid form', () => {
      const result = deadlineFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should validate form with minimal required fields', () => {
      const minimalData = {
        bookTitle: 'Minimal Book',
        format: 'physical',
        source: 'personal',
        deadline: new Date('2025-02-15T12:00:00Z'), // Future date relative to mocked time
        totalQuantity: 100,
        flexibility: 'flexible'
      };
      const result = deadlineFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });
}); 