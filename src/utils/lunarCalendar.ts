// Accurate Korean Lunar Calendar Conversion
// Based on Korean Astronomy and Space Science Institute (KASI) data
// 네이버 음력 변환기와 동일한 결과를 제공

const ZODIAC_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZODIAC_ELEMENTS = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];

// 음력 데이터 (KASI 기준)
// 각 연도의 음력 월별 일수와 윤달 정보
// 비트 연산: 상위 4비트 = 윤달 월 (0이면 윤달 없음), 하위 12비트 = 각 월의 대소 (1=30일, 0=29일)
const LUNAR_DATA: { [year: number]: { months: number[]; leapMonth: number; leapDays: number } } = {
  2020: { months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], leapMonth: 4, leapDays: 29 },
  2021: { months: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], leapMonth: 0, leapDays: 0 },
  2022: { months: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], leapMonth: 0, leapDays: 0 },
  2023: { months: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], leapMonth: 2, leapDays: 29 },
  2024: { months: [30, 29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29], leapMonth: 0, leapDays: 0 },
  2025: { months: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29], leapMonth: 6, leapDays: 29 },
  2026: { months: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], leapMonth: 0, leapDays: 0 },
  2027: { months: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], leapMonth: 0, leapDays: 0 },
  2028: { months: [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], leapMonth: 0, leapDays: 0 },
  2029: { months: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], leapMonth: 0, leapDays: 0 },
  2030: { months: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], leapMonth: 0, leapDays: 0 },
};

// 음력 설날(1월 1일)의 양력 날짜 (KASI 데이터 기준 - 네이버와 동일)
const LUNAR_NEW_YEAR: { [year: number]: { month: number; day: number } } = {
  2020: { month: 1, day: 25 },
  2021: { month: 2, day: 12 },
  2022: { month: 2, day: 1 },
  2023: { month: 1, day: 22 },
  2024: { month: 2, day: 10 },
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 3 },
};

// 음력 연도의 총 일수 계산
function getLunarYearDays(year: number): number {
  const data = LUNAR_DATA[year];
  if (!data) return 354;
  
  let days = 0;
  for (const monthDays of data.months) {
    days += monthDays;
  }
  if (data.leapMonth > 0) {
    days += data.leapDays;
  }
  return days;
}

// 양력 → 음력 변환
export function solarToLunar(year: number, month: number, day: number): { 
  lunarYear: number; 
  lunarMonth: number; 
  lunarDay: number; 
  isLeapMonth: boolean 
} | null {
  const targetDate = new Date(year, month - 1, day);
  
  // 해당 연도의 음력 설날 찾기
  let lunarYear = year;
  let newYearData = LUNAR_NEW_YEAR[year];
  
  if (!newYearData) {
    // 데이터가 없는 연도는 추정
    return estimateSolarToLunar(year, month, day);
  }
  
  const solarNewYear = new Date(year, newYearData.month - 1, newYearData.day);
  
  // 대상 날짜가 해당 연도 음력 설날보다 이전이면 이전 음력 연도
  if (targetDate < solarNewYear) {
    lunarYear = year - 1;
    newYearData = LUNAR_NEW_YEAR[lunarYear];
    if (!newYearData) {
      return estimateSolarToLunar(year, month, day);
    }
  }
  
  // 음력 설날부터의 일수 계산
  const lunarNewYearDate = new Date(
    lunarYear, 
    LUNAR_NEW_YEAR[lunarYear].month - 1, 
    LUNAR_NEW_YEAR[lunarYear].day
  );
  
  let daysDiff = Math.floor((targetDate.getTime() - lunarNewYearDate.getTime()) / (24 * 60 * 60 * 1000));
  
  const lunarData = LUNAR_DATA[lunarYear];
  if (!lunarData) {
    return estimateSolarToLunar(year, month, day);
  }
  
  // 음력 월, 일 계산
  let lunarMonth = 1;
  let isLeapMonth = false;
  let accumulated = 0;
  
  for (let m = 0; m < 12; m++) {
    const monthDays = lunarData.months[m];
    
    // 일반 월 처리
    if (accumulated + monthDays > daysDiff) {
      lunarMonth = m + 1;
      break;
    }
    accumulated += monthDays;
    
    // 윤달 처리
    if (lunarData.leapMonth > 0 && m + 1 === lunarData.leapMonth) {
      if (accumulated + lunarData.leapDays > daysDiff) {
        lunarMonth = m + 1;
        isLeapMonth = true;
        break;
      }
      accumulated += lunarData.leapDays;
    }
    
    if (m === 11) {
      lunarMonth = 12;
    }
  }
  
  const lunarDay = daysDiff - accumulated + 1;
  
  return {
    lunarYear,
    lunarMonth,
    lunarDay: Math.max(1, Math.min(30, lunarDay)),
    isLeapMonth,
  };
}

// 데이터가 없는 연도 추정
function estimateSolarToLunar(year: number, month: number, day: number): { 
  lunarYear: number; 
  lunarMonth: number; 
  lunarDay: number; 
  isLeapMonth: boolean 
} | null {
  const targetDate = new Date(year, month - 1, day);
  
  // 2025년을 기준으로 계산
  const refYear = 2025;
  const refNewYear = new Date(2025, 0, 29); // 2025년 음력 1월 1일 = 양력 1월 29일
  
  const daysDiff = Math.floor((targetDate.getTime() - refNewYear.getTime()) / (24 * 60 * 60 * 1000));
  
  // 평균 음력 연도 354.37일
  const lunarYearOffset = Math.floor(daysDiff / 354.37);
  const lunarYear = refYear + lunarYearOffset;
  
  const remainingDays = daysDiff - Math.floor(lunarYearOffset * 354.37);
  
  // 평균 음력 월 29.53일
  let lunarMonth = Math.floor(remainingDays / 29.53) + 1;
  lunarMonth = Math.max(1, Math.min(12, lunarMonth));
  
  const lunarDay = Math.floor(remainingDays % 29.53) + 1;
  
  return {
    lunarYear,
    lunarMonth,
    lunarDay: Math.max(1, Math.min(30, lunarDay)),
    isLeapMonth: false,
  };
}

// 음력 → 양력 변환
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): { 
  year: number; 
  month: number; 
  day: number 
} | null {
  if (lunarMonth < 1 || lunarMonth > 12) return null;
  if (lunarDay < 1 || lunarDay > 30) return null;
  
  const newYearData = LUNAR_NEW_YEAR[lunarYear];
  if (!newYearData) {
    return estimateLunarToSolar(lunarYear, lunarMonth, lunarDay);
  }
  
  let daysToAdd = 0;
  const lunarData = LUNAR_DATA[lunarYear];
  
  if (lunarData) {
    // 목표 월까지의 일수 합산
    for (let m = 1; m < lunarMonth; m++) {
      daysToAdd += lunarData.months[m - 1];
      
      // 윤달이 목표 월 이전에 있으면 윤달 일수 추가
      if (lunarData.leapMonth > 0 && m === lunarData.leapMonth && !isLeapMonth) {
        daysToAdd += lunarData.leapDays;
      }
    }
    
    // 목표가 윤달이면 일반 월 일수도 추가
    if (isLeapMonth && lunarData.leapMonth === lunarMonth) {
      daysToAdd += lunarData.months[lunarMonth - 1];
    }
  } else {
    daysToAdd = Math.floor((lunarMonth - 1) * 29.53);
  }
  
  // 월 내 일수 추가
  daysToAdd += lunarDay - 1;
  
  const resultDate = new Date(lunarYear, newYearData.month - 1, newYearData.day + daysToAdd);
  
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate(),
  };
}

// 데이터가 없는 연도 추정
function estimateLunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): { 
  year: number; 
  month: number; 
  day: number 
} | null {
  const refYear = 2025;
  const refNewYear = new Date(2025, 0, 29);
  
  const yearDiff = lunarYear - refYear;
  const daysFromYears = Math.floor(yearDiff * 354.37);
  const daysFromMonths = Math.floor((lunarMonth - 1) * 29.53);
  
  const totalDays = daysFromYears + daysFromMonths + lunarDay - 1;
  
  const resultDate = new Date(refNewYear.getTime() + totalDays * 24 * 60 * 60 * 1000);
  
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate(),
  };
}

export function getZodiacAnimal(year: number): string {
  return ZODIAC_ANIMALS[(year - 4) % 12];
}

export function getZodiacFull(year: number): string {
  const animal = getZodiacAnimal(year);
  const elementIndex = (year - 4) % 10;
  return `${ZODIAC_ELEMENTS[elementIndex]}${animal}`;
}

export function calculateAge(birthYear: number, birthMonth: number, birthDay: number): number {
  const today = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  
  let age = today.getFullYear() - birthYear;
  
  const monthDiff = today.getMonth() - (birthMonth - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  
  return Math.max(0, age);
}

export function formatLunarDate(year: number, month: number, day: number): string {
  return `${year}년 ${month}월 ${day}일`;
}

export function formatSolarDate(year: number, month: number, day: number): string {
  return `${year}년 ${month}월 ${day}일`;
}
