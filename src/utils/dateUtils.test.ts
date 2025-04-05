import { calculateAge, getAgeRangeFromDob, formatDateOfBirth, isValidDateOfBirth } from './dateUtils';

// Mock current date for consistent testing
const mockDate = new Date(2023, 5, 15); // June 15, 2023
const originalDate = global.Date;

beforeAll(() => {
  // @ts-ignore - Mock Date constructor
  global.Date = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return mockDate;
      }
      // @ts-ignore
      return new originalDate(...args);
    }
  };
});

afterAll(() => {
  global.Date = originalDate;
});

describe('calculateAge', () => {
  it('calculates age correctly', () => {
    expect(calculateAge('1990-01-01')).toBe(33);
    expect(calculateAge('2000-01-01')).toBe(23);
  });

  it('handles birthday that has not occurred yet this year', () => {
    expect(calculateAge('1990-12-31')).toBe(32);
  });

  it('returns null for invalid dates', () => {
    expect(calculateAge(null)).toBeNull();
    expect(calculateAge('invalid-date')).toBeNull();
  });
});

describe('getAgeRangeFromDob', () => {
  it('returns correct age range categories', () => {
    expect(getAgeRangeFromDob('2010-01-01')).toBe('under18');
    expect(getAgeRangeFromDob('2001-01-01')).toBe('18-24');
    expect(getAgeRangeFromDob('1995-01-01')).toBe('25-34');
    expect(getAgeRangeFromDob('1985-01-01')).toBe('35-44');
    expect(getAgeRangeFromDob('1975-01-01')).toBe('45-54');
    expect(getAgeRangeFromDob('1965-01-01')).toBe('55-64');
    expect(getAgeRangeFromDob('1950-01-01')).toBe('65+');
  });

  it('returns null for invalid dates', () => {
    expect(getAgeRangeFromDob(null)).toBeNull();
    expect(getAgeRangeFromDob('invalid-date')).toBeNull();
  });
});

describe('formatDateOfBirth', () => {
  it('formats date in long format by default', () => {
    expect(formatDateOfBirth('1990-01-01')).toBe('January 1, 1990');
  });

  it('formats date in medium format', () => {
    expect(formatDateOfBirth('1990-01-01', 'medium')).toBe('Jan 1, 1990');
  });

  it('formats date in short format', () => {
    expect(formatDateOfBirth('1990-01-01', 'short')).toBe('01/01/1990');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatDateOfBirth(null)).toBe('');
    expect(formatDateOfBirth('invalid-date')).toBe('');
  });
});

describe('isValidDateOfBirth', () => {
  it('returns true for valid dates in the past', () => {
    expect(isValidDateOfBirth('1990-01-01')).toBe(true);
    expect(isValidDateOfBirth('2023-01-01')).toBe(true);
  });

  it('returns false for future dates', () => {
    expect(isValidDateOfBirth('2023-12-31')).toBe(false);
  });

  it('returns false for invalid dates', () => {
    expect(isValidDateOfBirth(null)).toBe(false);
    expect(isValidDateOfBirth('invalid-date')).toBe(false);
  });
});
