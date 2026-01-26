import { Holiday } from '@/types/calendar';
import { lunarToSolar } from './lunarCalendar';

// Fixed solar holidays (대한민국 법정 공휴일)
const SOLAR_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 1, name: '근로자의 날' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '크리스마스' },
];

// Lunar holidays (converted to solar each year)
const LUNAR_HOLIDAYS: { month: number; day: number; name: string; days?: number[] }[] = [
  { month: 1, day: 1, name: '설날', days: [-1, 0, 1] }, // 설날 전날, 설날, 설날 다음날
  { month: 4, day: 8, name: '부처님오신날' },
  { month: 8, day: 15, name: '추석', days: [-1, 0, 1] }, // 추석 전날, 추석, 추석 다음날
];

// Special holidays that need calculation (대체공휴일 등)
// 어린이날, 설날, 추석이 일요일과 겹치면 다음 평일이 대체공휴일
function getSubstituteHolidays(year: number, baseHolidays: Holiday[]): Holiday[] {
  const substituteHolidays: Holiday[] = [];
  
  // Check Children's Day (5월 5일)
  const childrenDay = new Date(year, 4, 5); // May 5
  if (childrenDay.getDay() === 0) { // Sunday
    substituteHolidays.push({
      date: `${year}-05-06`,
      name: '어린이날 대체공휴일',
      isHoliday: true,
    });
  } else if (childrenDay.getDay() === 6) { // Saturday
    substituteHolidays.push({
      date: `${year}-05-07`,
      name: '어린이날 대체공휴일',
      isHoliday: true,
    });
  }

  // Check 삼일절 substitute (from 2022)
  if (year >= 2022) {
    const marchFirst = new Date(year, 2, 1);
    if (marchFirst.getDay() === 0) {
      substituteHolidays.push({
        date: `${year}-03-02`,
        name: '삼일절 대체공휴일',
        isHoliday: true,
      });
    }
  }

  // Check 광복절 substitute (from 2021)
  if (year >= 2021) {
    const liberationDay = new Date(year, 7, 15);
    if (liberationDay.getDay() === 0) {
      substituteHolidays.push({
        date: `${year}-08-16`,
        name: '광복절 대체공휴일',
        isHoliday: true,
      });
    }
  }

  // Check 개천절 substitute (from 2021)
  if (year >= 2021) {
    const foundationDay = new Date(year, 9, 3);
    if (foundationDay.getDay() === 0) {
      substituteHolidays.push({
        date: `${year}-10-04`,
        name: '개천절 대체공휴일',
        isHoliday: true,
      });
    }
  }

  // Check 한글날 substitute (from 2021)
  if (year >= 2021) {
    const hangulDay = new Date(year, 9, 9);
    if (hangulDay.getDay() === 0) {
      substituteHolidays.push({
        date: `${year}-10-10`,
        name: '한글날 대체공휴일',
        isHoliday: true,
      });
    }
  }

  // Check 크리스마스 substitute (from 2023)
  if (year >= 2023) {
    const christmas = new Date(year, 11, 25);
    if (christmas.getDay() === 0) {
      substituteHolidays.push({
        date: `${year}-12-26`,
        name: '크리스마스 대체공휴일',
        isHoliday: true,
      });
    }
  }

  return substituteHolidays;
}

// Special election days (임시공휴일 - 선거일 등)
function getElectionHolidays(year: number): Holiday[] {
  const electionHolidays: Holiday[] = [];
  
  // Known election days
  const knownElections: { [key: number]: { date: string; name: string }[] } = {
    2024: [
      { date: '2024-04-10', name: '제22대 국회의원선거일' },
    ],
    2025: [
      // Add future elections as they are announced
    ],
    2026: [
      { date: '2026-06-03', name: '제9회 전국동시지방선거일' }, // Typically first Wednesday of June
    ],
    2027: [
      { date: '2027-03-03', name: '제21대 대통령선거일' }, // Expected
    ],
  };

  if (knownElections[year]) {
    knownElections[year].forEach(election => {
      electionHolidays.push({
        date: election.date,
        name: election.name,
        isHoliday: true,
      });
    });
  }

  return electionHolidays;
}

export function getKoreanHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Add solar holidays
  for (const holiday of SOLAR_HOLIDAYS) {
    const dateStr = `${year}-${String(holiday.month).padStart(2, '0')}-${String(holiday.day).padStart(2, '0')}`;
    holidays.push({
      date: dateStr,
      name: holiday.name,
      isHoliday: true,
    });
  }

  // Add lunar holidays (converted to solar)
  for (const holiday of LUNAR_HOLIDAYS) {
    // First get the base solar date for the lunar holiday
    const baseSolarDate = lunarToSolar(year, holiday.month, holiday.day);
    
    if (baseSolarDate) {
      const days = holiday.days || [0];
      
      for (const dayOffset of days) {
        // Calculate solar date by adding offset to base solar date
        const targetDate = new Date(baseSolarDate.year, baseSolarDate.month - 1, baseSolarDate.day + dayOffset);
        const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
        
        let name = holiday.name;
        if (dayOffset === -1) name = `${holiday.name} 전날`;
        else if (dayOffset === 1) name = `${holiday.name} 다음날`;
        
        holidays.push({
          date: dateStr,
          name,
          isHoliday: true,
        });
      }
    }
  }

  // Add substitute holidays (대체공휴일)
  const substituteHolidays = getSubstituteHolidays(year, holidays);
  holidays.push(...substituteHolidays);

  // Add election holidays (선거일)
  const electionHolidays = getElectionHolidays(year);
  holidays.push(...electionHolidays);

  // Check for 설날/추석 substitute holidays
  // If any day of 설날/추석 연휴 falls on Sunday, next Monday is substitute
  const lunarNewYear = lunarToSolar(year, 1, 1);
  if (lunarNewYear) {
    const newYearDate = new Date(lunarNewYear.year, lunarNewYear.month - 1, lunarNewYear.day);
    // Check if 설날 연휴 overlaps with Sunday
    for (let i = -1; i <= 1; i++) {
      const checkDate = new Date(newYearDate);
      checkDate.setDate(checkDate.getDate() + i);
      if (checkDate.getDay() === 0) { // Sunday
        const substituteDate = new Date(newYearDate);
        substituteDate.setDate(substituteDate.getDate() + 2); // Day after 설날 다음날
        const subDateStr = `${substituteDate.getFullYear()}-${String(substituteDate.getMonth() + 1).padStart(2, '0')}-${String(substituteDate.getDate()).padStart(2, '0')}`;
        // Check if not already a holiday
        if (!holidays.some(h => h.date === subDateStr)) {
          holidays.push({
            date: subDateStr,
            name: '설날 대체공휴일',
            isHoliday: true,
          });
        }
        break;
      }
    }
  }

  const chuseok = lunarToSolar(year, 8, 15);
  if (chuseok) {
    const chuseokDate = new Date(chuseok.year, chuseok.month - 1, chuseok.day);
    // Check if 추석 연휴 overlaps with Sunday
    for (let i = -1; i <= 1; i++) {
      const checkDate = new Date(chuseokDate);
      checkDate.setDate(checkDate.getDate() + i);
      if (checkDate.getDay() === 0) { // Sunday
        const substituteDate = new Date(chuseokDate);
        substituteDate.setDate(substituteDate.getDate() + 2); // Day after 추석 다음날
        const subDateStr = `${substituteDate.getFullYear()}-${String(substituteDate.getMonth() + 1).padStart(2, '0')}-${String(substituteDate.getDate()).padStart(2, '0')}`;
        // Check if not already a holiday
        if (!holidays.some(h => h.date === subDateStr)) {
          holidays.push({
            date: subDateStr,
            name: '추석 대체공휴일',
            isHoliday: true,
          });
        }
        break;
      }
    }
  }

  return holidays;
}

export function getHolidayForDate(date: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find(h => h.date === date);
}
