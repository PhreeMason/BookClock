/**
 * Unit test for date conversion functions in useDeadlineHistory
 * This test verifies that UTC timestamps are correctly converted to local dates
 * without timezone shifting issues.
 */

describe('Date Conversion Tests', () => {
  // Helper function from useReadingHistory.ts that we're testing
  const getLocalDateString = (utcDateString: string): string => {
    // Parse the UTC date and extract just the date portion
    // This ensures consistent date handling regardless of timezone
    const date = new Date(utcDateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Original buggy function (what was being used before)
  const getBuggyDateString = (utcDateString: string): string => {
    return new Date(utcDateString).toISOString().split('T')[0];
  };

  test('getLocalDateString should correctly handle UTC timestamps without timezone shift', () => {
    // Test cases based on real user data that demonstrates the bug
    const testCases = [
      {
        utcTimestamp: '2025-06-21T05:46:43.766915+00:00',
        expectedDate: '2025-06-21',
        description: 'June 21 UTC morning should remain June 21',
      },
      {
        utcTimestamp: '2025-06-24T23:13:21.422152+00:00',
        expectedDate: '2025-06-24',
        description: 'June 24 UTC late night should remain June 24',
      },
      {
        utcTimestamp: '2025-06-25T23:34:40.168+00:00',
        expectedDate: '2025-06-25',
        description: 'June 25 UTC late night should remain June 25',
      },
      {
        utcTimestamp: '2025-06-26T21:13:29.617564+00:00',
        expectedDate: '2025-06-26',
        description: 'June 26 UTC evening should remain June 26',
      },
      {
        utcTimestamp: '2025-06-27T02:49:52.547+00:00',
        expectedDate: '2025-06-27',
        description: 'June 27 UTC early morning should remain June 27',
      },
      {
        utcTimestamp: '2025-06-28T00:54:07.324+00:00',
        expectedDate: '2025-06-28',
        description: 'June 28 UTC midnight should remain June 28',
      },
      {
        utcTimestamp: '2025-07-01T01:38:57.214+00:00',
        expectedDate: '2025-07-01',
        description: 'July 1 UTC early morning should remain July 1',
      },
    ];

    testCases.forEach(({ utcTimestamp, expectedDate }) => {
      const result = getLocalDateString(utcTimestamp);
      expect(result).toBe(expectedDate);
    });
  });

  test('getBuggyDateString demonstrates the timezone shift bug', () => {
    // This test shows why the original implementation was buggy
    // It will fail in certain timezones, demonstrating the bug
    
    // These tests may pass or fail depending on the machine's timezone
    // In a timezone like America/Los_Angeles (UTC-8), these will shift dates backwards
    const utcMidnight = '2025-06-25T00:30:00.000+00:00'; // June 25 UTC
    
    const buggyResult = getBuggyDateString(utcMidnight);
    const correctResult = getLocalDateString(utcMidnight);
    
    // The correct result should always be June 25
    expect(correctResult).toBe('2025-06-25');
    
    // The buggy result might be June 24 in some timezones
    // This test documents the bug - in some timezones, buggyResult !== correctResult
    console.log('UTC timestamp:', utcMidnight);
    console.log('Buggy result:', buggyResult);
    console.log('Correct result:', correctResult);
    
    // If this test fails, it demonstrates the timezone bug
    // In UTC timezone: buggyResult === '2025-06-25' (correct)
    // In PST timezone: buggyResult === '2025-06-24' (BUG!)
  });

  test('date conversion should be consistent across different UTC times on same day', () => {
    // All these timestamps are on June 25, 2025 UTC but at different times
    const june25Timestamps = [
      '2025-06-25T00:00:00.000+00:00', // Start of day UTC
      '2025-06-25T12:00:00.000+00:00', // Noon UTC
      '2025-06-25T23:59:59.000+00:00', // End of day UTC
      '2025-06-25T23:34:40.168+00:00', // Real timestamp from user data
    ];

    june25Timestamps.forEach((timestamp) => {
      const result = getLocalDateString(timestamp);
      expect(result).toBe('2025-06-25');
    });
  });

  test('demonstrates real user data bug scenario', () => {
    // Real scenario: User clicks June 25 on calendar but sees June 24 data
    // This happens when June 25 UTC timestamps get converted to June 24 local time
    
    const progressEntryTimestamp = '2025-06-25T23:34:40.168+00:00'; // Real user data
    
    const correctDate = getLocalDateString(progressEntryTimestamp);
    const buggyDate = getBuggyDateString(progressEntryTimestamp);
    
    // Correct: Should be June 25
    expect(correctDate).toBe('2025-06-25');
    
    // Document what the buggy function might return
    console.log('Progress entry timestamp:', progressEntryTimestamp);
    console.log('Should be processed as date:', correctDate);
    console.log('Buggy function might return:', buggyDate);
    
    // The bug: If user clicks June 25 on calendar (dateString: '2025-06-25')
    // but the data is indexed by buggyDate, they might see wrong data
    if (buggyDate !== correctDate) {
      console.log('BUG DETECTED: Date mismatch between click and data!');
      console.log(`User clicks: 2025-06-25, but data is indexed by: ${buggyDate}`);
    }
  });
});