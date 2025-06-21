import {
    calculateCurrentProgress,
    calculateCurrentProgressFromForm,
    calculateRemaining,
    calculateRemainingFromForm,
    calculateTotalQuantity,
    calculateTotalQuantityFromForm,
    getPaceEstimate,
    getReadingEstimate
} from '../deadlineCalculations';

describe('deadlineCalculations', () => {
  describe('calculateTotalQuantityFromForm', () => {
    it('should handle physical format correctly', () => {
      expect(calculateTotalQuantityFromForm('physical', 300)).toBe(300);
      expect(calculateTotalQuantityFromForm('physical', '250')).toBe(250);
      expect(calculateTotalQuantityFromForm('physical', 100, 50)).toBe(100); // minutes ignored for physical
    });

    it('should handle ebook format correctly', () => {
      expect(calculateTotalQuantityFromForm('ebook', 400)).toBe(400);
      expect(calculateTotalQuantityFromForm('ebook', '350')).toBe(350);
      expect(calculateTotalQuantityFromForm('ebook', 200, 30)).toBe(200); // minutes ignored for ebook
    });

    it('should handle audio format correctly', () => {
      expect(calculateTotalQuantityFromForm('audio', 5, 30)).toBe(330); // 5 hours + 30 minutes = 330 minutes
      expect(calculateTotalQuantityFromForm('audio', '3', '45')).toBe(225); // 3 hours + 45 minutes = 225 minutes
      expect(calculateTotalQuantityFromForm('audio', 2)).toBe(120); // 2 hours = 120 minutes
      expect(calculateTotalQuantityFromForm('audio', '1', 0)).toBe(60); // 1 hour = 60 minutes
    });
  });

  describe('calculateCurrentProgressFromForm', () => {
    it('should handle physical format correctly', () => {
      expect(calculateCurrentProgressFromForm('physical', 150)).toBe(150);
      expect(calculateCurrentProgressFromForm('physical', '100')).toBe(100);
      expect(calculateCurrentProgressFromForm('physical', 0, 20)).toBe(0); // minutes ignored for physical
    });

    it('should handle ebook format correctly', () => {
      expect(calculateCurrentProgressFromForm('ebook', 200)).toBe(200);
      expect(calculateCurrentProgressFromForm('ebook', '180')).toBe(180);
      expect(calculateCurrentProgressFromForm('ebook', 0, 15)).toBe(0); // minutes ignored for ebook
    });

    it('should handle audio format correctly', () => {
      expect(calculateCurrentProgressFromForm('audio', 2, 15)).toBe(135); // 2 hours + 15 minutes = 135 minutes
      expect(calculateCurrentProgressFromForm('audio', '1', '30')).toBe(90); // 1 hour + 30 minutes = 90 minutes
      expect(calculateCurrentProgressFromForm('audio', 0)).toBe(0);
      expect(calculateCurrentProgressFromForm('audio', '0', 0)).toBe(0);
    });
  });

  describe('calculateTotalQuantity', () => {
    it('should handle physical format correctly', () => {
      expect(calculateTotalQuantity('physical', 300)).toBe(300);
      expect(calculateTotalQuantity('physical', '250')).toBe(250);
      expect(calculateTotalQuantity('physical', 100, 50)).toBe(100); // minutes ignored for physical
    });

    it('should handle ebook format correctly', () => {
      expect(calculateTotalQuantity('ebook', 400)).toBe(400);
      expect(calculateTotalQuantity('ebook', '350')).toBe(350);
      expect(calculateTotalQuantity('ebook', 200, 30)).toBe(200); // minutes ignored for ebook
    });

    it('should handle audio format correctly', () => {
      expect(calculateTotalQuantity('audio', 300, 30)).toBe(330); // 300 minutes + 30 minutes = 330 minutes
      expect(calculateTotalQuantity('audio', '180', '45')).toBe(225); // 180 minutes + 45 minutes = 225 minutes
      expect(calculateTotalQuantity('audio', 120)).toBe(120); // 120 minutes
      expect(calculateTotalQuantity('audio', '60', 0)).toBe(60); // 60 minutes
    });
  });

  describe('calculateCurrentProgress', () => {
    it('should handle physical format correctly', () => {
      expect(calculateCurrentProgress('physical', 150)).toBe(150);
      expect(calculateCurrentProgress('physical', '100')).toBe(100);
      expect(calculateCurrentProgress('physical', 0, 20)).toBe(0); // minutes ignored for physical
    });

    it('should handle ebook format correctly', () => {
      expect(calculateCurrentProgress('ebook', 200)).toBe(200);
      expect(calculateCurrentProgress('ebook', '180')).toBe(180);
      expect(calculateCurrentProgress('ebook', 0, 15)).toBe(0); // minutes ignored for ebook
    });

    it('should handle audio format correctly', () => {
      expect(calculateCurrentProgress('audio', 120, 15)).toBe(135); // 120 minutes + 15 minutes = 135 minutes
      expect(calculateCurrentProgress('audio', '90', '30')).toBe(120); // 90 minutes + 30 minutes = 120 minutes
      expect(calculateCurrentProgress('audio', 0)).toBe(0);
      expect(calculateCurrentProgress('audio', '0', 0)).toBe(0);
    });
  });

  describe('calculateRemaining', () => {
    it('should calculate remaining for physical format', () => {
      expect(calculateRemaining('physical', 300, undefined, 150, undefined)).toBe(150);
      expect(calculateRemaining('physical', '250', undefined, '100', undefined)).toBe(150);
    });

    it('should calculate remaining for ebook format', () => {
      expect(calculateRemaining('ebook', 400, undefined, 200, undefined)).toBe(200);
      expect(calculateRemaining('ebook', '350', undefined, '180', undefined)).toBe(170);
    });

    it('should calculate remaining for audio format', () => {
      expect(calculateRemaining('audio', 300, 30, 120, 15)).toBe(195); // (300+30) - (120+15) = 195
      expect(calculateRemaining('audio', '180', '45', '90', '30')).toBe(105); // (180+45) - (90+30) = 105
    });

    it('should handle zero remaining', () => {
      expect(calculateRemaining('physical', 100, undefined, 100, undefined)).toBe(0);
      expect(calculateRemaining('audio', 120, 0, 120, 0)).toBe(0);
    });

    it('should handle negative remaining (over progress)', () => {
      expect(calculateRemaining('physical', 100, undefined, 150, undefined)).toBe(-50);
      expect(calculateRemaining('audio', 60, 0, 90, 0)).toBe(-30);
    });
  });

  describe('calculateRemainingFromForm', () => {
    it('should calculate remaining for physical format from form data', () => {
      expect(calculateRemainingFromForm('physical', 300, undefined, 150, undefined)).toBe(150);
      expect(calculateRemainingFromForm('physical', '250', undefined, '100', undefined)).toBe(150);
    });

    it('should calculate remaining for ebook format from form data', () => {
      expect(calculateRemainingFromForm('ebook', 400, undefined, 200, undefined)).toBe(200);
      expect(calculateRemainingFromForm('ebook', '350', undefined, '180', undefined)).toBe(170);
    });

    it('should calculate remaining for audio format from form data', () => {
      expect(calculateRemainingFromForm('audio', 5, 30, 2, 15)).toBe(195); // (5*60+30) - (2*60+15) = 195
      expect(calculateRemainingFromForm('audio', '3', '45', '1', '30')).toBe(135); // (3*60+45) - (1*60+30) = 135
    });
  });

  describe('getReadingEstimate', () => {
    it('should return empty string for zero or negative remaining', () => {
      expect(getReadingEstimate('physical', 0)).toBe('');
      expect(getReadingEstimate('ebook', -10)).toBe('');
      expect(getReadingEstimate('audio', 0)).toBe('');
    });

    it('should calculate reading estimate for physical format', () => {
      expect(getReadingEstimate('physical', 40)).toBe('📖 About 1 hours of reading time');
      expect(getReadingEstimate('physical', 80)).toBe('📖 About 2 hours of reading time');
      expect(getReadingEstimate('physical', 120)).toBe('📖 About 3 hours of reading time');
    });

    it('should calculate reading estimate for ebook format', () => {
      expect(getReadingEstimate('ebook', 40)).toBe('📖 About 1 hours of reading time');
      expect(getReadingEstimate('ebook', 80)).toBe('📖 About 2 hours of reading time');
    });

    it('should calculate listening estimate for audio format', () => {
      expect(getReadingEstimate('audio', 60)).toBe('🎧 About 1 hour of listening time');
      expect(getReadingEstimate('audio', 120)).toBe('🎧 About 2 hours of listening time');
      expect(getReadingEstimate('audio', 90)).toBe('🎧 About 1 hour and 30 minutes of listening time');
      expect(getReadingEstimate('audio', 30)).toBe('🎧 About 30 minutes of listening time');
      expect(getReadingEstimate('audio', 150)).toBe('🎧 About 2 hours and 30 minutes of listening time');
    });
  });

  describe('getPaceEstimate', () => {
    const mockDate = new Date('2024-01-01T00:00:00Z');
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return empty string for zero or negative remaining', () => {
      const futureDate = new Date('2024-01-15T00:00:00Z');
      expect(getPaceEstimate('physical', futureDate, 0)).toBe('');
      expect(getPaceEstimate('ebook', futureDate, -10)).toBe('');
      expect(getPaceEstimate('audio', futureDate, 0)).toBe('');
    });

    it('should return warning for past deadline', () => {
      const pastDate = new Date('2023-12-01T00:00:00Z');
      expect(getPaceEstimate('physical', pastDate, 100)).toBe('⚠️ This deadline has already passed');
      expect(getPaceEstimate('audio', pastDate, 60)).toBe('⚠️ This deadline has already passed');
    });

    it('should calculate pace for physical format', () => {
      const futureDate = new Date('2024-01-15T00:00:00Z'); // 14 days from mock date
      expect(getPaceEstimate('physical', futureDate, 140)).toBe('📅 You\'ll need to read 10 pages/day to finish on time');
      expect(getPaceEstimate('physical', futureDate, 280)).toBe('📅 You\'ll need to read 20 pages/day to finish on time');
    });

    it('should calculate pace for ebook format', () => {
      const futureDate = new Date('2024-01-15T00:00:00Z'); // 14 days from mock date
      expect(getPaceEstimate('ebook', futureDate, 140)).toBe('📅 You\'ll need to read 10 pages/day to finish on time');
      expect(getPaceEstimate('ebook', futureDate, 280)).toBe('📅 You\'ll need to read 20 pages/day to finish on time');
    });

    it('should calculate pace for audio format', () => {
      const futureDate = new Date('2024-01-15T00:00:00Z'); // 14 days from mock date
      expect(getPaceEstimate('audio', futureDate, 840)).toBe('📅 You\'ll need to listen 1 hour/day to finish on time'); // 60 minutes per day
      expect(getPaceEstimate('audio', futureDate, 1260)).toBe('📅 You\'ll need to listen 1 hour 30 minutes/day to finish on time'); // 90 minutes per day
      expect(getPaceEstimate('audio', futureDate, 420)).toBe('📅 You\'ll need to listen 30 minutes/day to finish on time'); // 30 minutes per day
      expect(getPaceEstimate('audio', futureDate, 1680)).toBe('📅 You\'ll need to listen 2 hours/day to finish on time'); // 120 minutes per day
    });

    it('should handle single day deadline', () => {
      const tomorrow = new Date('2024-01-02T00:00:00Z'); // 1 day from mock date
      expect(getPaceEstimate('physical', tomorrow, 40)).toBe('📅 You\'ll need to read 40 pages/day to finish on time');
      expect(getPaceEstimate('audio', tomorrow, 60)).toBe('📅 You\'ll need to listen 1 hour/day to finish on time');
    });
  });
}); 