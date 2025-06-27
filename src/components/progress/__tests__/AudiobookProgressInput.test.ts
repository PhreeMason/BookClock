import { parseAudiobookTime, formatAudiobookTime } from '../AudiobookProgressInput';

describe('parseAudiobookTime', () => {
  test('parses various time formats correctly', () => {
    // Basic formats
    expect(parseAudiobookTime('3h 2m')).toBe(182);
    expect(parseAudiobookTime('3H 2M')).toBe(182);
    expect(parseAudiobookTime('3h2m')).toBe(182);
    expect(parseAudiobookTime('3h  2m')).toBe(182);
    
    // With leading zeros
    expect(parseAudiobookTime('03h 02m')).toBe(182);
    expect(parseAudiobookTime('3h 02m')).toBe(182);
    expect(parseAudiobookTime('03h 2m')).toBe(182);
    
    // Hours only
    expect(parseAudiobookTime('3h')).toBe(180);
    expect(parseAudiobookTime('3H')).toBe(180);
    expect(parseAudiobookTime('03h')).toBe(180);
    
    // Minutes only
    expect(parseAudiobookTime('45m')).toBe(45);
    expect(parseAudiobookTime('45M')).toBe(45);
    expect(parseAudiobookTime('045m')).toBe(45);
    
    // Decimal hours
    expect(parseAudiobookTime('2.5h')).toBe(150);
    expect(parseAudiobookTime('2,5h')).toBe(150);
    
    // Colon format (ignoring seconds)
    expect(parseAudiobookTime('3:02')).toBe(182);
    expect(parseAudiobookTime('03:02')).toBe(182);
    expect(parseAudiobookTime('3:02:45')).toBe(182); // Ignores seconds
    
    // Full words
    expect(parseAudiobookTime('3 hours 2 minutes')).toBe(182);
    expect(parseAudiobookTime('3 hour 2 minute')).toBe(182);
    expect(parseAudiobookTime('3 hrs 2 mins')).toBe(182);
    expect(parseAudiobookTime('3hr 2min')).toBe(182);
    
    // Plain numbers (assumes minutes)
    expect(parseAudiobookTime('182')).toBe(182);
    expect(parseAudiobookTime('45')).toBe(45);
    
    // Edge cases
    expect(parseAudiobookTime('')).toBe(0);
    expect(parseAudiobookTime('  ')).toBe(0);
    expect(parseAudiobookTime('0')).toBe(0);
    expect(parseAudiobookTime('0h 0m')).toBe(0);
    
    // Invalid formats
    expect(parseAudiobookTime('invalid')).toBeNull();
    expect(parseAudiobookTime('three hours')).toBeNull();
    expect(parseAudiobookTime('-3h')).toBeNull();
  });
});

describe('formatAudiobookTime', () => {
  test('formats minutes to readable time string', () => {
    expect(formatAudiobookTime(182)).toBe('3h 2m');
    expect(formatAudiobookTime(180)).toBe('3h');
    expect(formatAudiobookTime(45)).toBe('45m');
    expect(formatAudiobookTime(0)).toBe('0m');
    expect(formatAudiobookTime(-5)).toBe('0m');
  });
});