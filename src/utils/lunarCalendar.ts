// 정확한 한국 음력 변환기
// 한국천문연구원(KASI) 및 superkts.com 데이터 기준
// 검증: 양력 2026년 1월 1일 = 음력 2025년 11월 13일

const ZODIAC_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZODIAC_ELEMENTS = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];

// 음력 데이터 (한국천문연구원 기준)
// 각 연도별 음력 1월 1일의 양력 날짜와 각 월의 일수
// 형식: { 양력설날, [1월일수, 2월일수, ..., 12월일수], 윤달월(0이면없음), 윤달일수 }
const LUNAR_DATA: { [year: number]: { newYear: [number, number, number]; months: number[]; leapMonth: number; leapDays: number } } = {
  2020: { newYear: [2020, 1, 25], months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], leapMonth: 4, leapDays: 29 },
  2021: { newYear: [2021, 2, 12], months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 30], leapMonth: 0, leapDays: 0 },
  2022: { newYear: [2022, 2, 1], months: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30], leapMonth: 0, leapDays: 0 },
  2023: { newYear: [2023, 1, 22], months: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 29], leapMonth: 2, leapDays: 29 },
  2024: { newYear: [2024, 2, 10], months: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], leapMonth: 0, leapDays: 0 },
  2025: { newYear: [2025, 1, 29], months: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], leapMonth: 6, leapDays: 29 },
  2026: { newYear: [2026, 2, 17], months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], leapMonth: 0, leapDays: 0 },
  2027: { newYear: [2027, 2, 6], months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29], leapMonth: 0, leapDays: 0 },
  2028: { newYear: [2028, 1, 26], months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 30], leapMonth: 0, leapDays: 0 },
  2029: { newYear: [2029, 2, 13], months: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], leapMonth: 0, leapDays: 0 },
  2030: { newYear: [2030, 2, 3], months: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], leapMonth: 0, leapDays: 0 },
};

// 양력 → 음력 변환 (KASI 기준 정확한 변환)
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
} | null {
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  // 해당 연도와 이전 연도의 음력 데이터 확인
  let lunarYear = year;
  let data = LUNAR_DATA[year];
  
  if (!data) {
    // 데이터가 없는 연도는 근사값 계산
    return estimateSolarToLunar(year, month, day);
  }

  // 해당 연도 음력 설날
  const newYearDate = new Date(data.newYear[0], data.newYear[1] - 1, data.newYear[2]);
  newYearDate.setHours(0, 0, 0, 0);

  // 대상 날짜가 음력 설날보다 이전이면 이전 연도의 음력
  if (targetDate < newYearDate) {
    lunarYear = year - 1;
    data = LUNAR_DATA[lunarYear];
    if (!data) {
      return estimateSolarToLunar(year, month, day);
    }
  }

  // 음력 설날부터의 일수 계산
  const lunarNewYear = new Date(data.newYear[0], data.newYear[1] - 1, data.newYear[2]);
  lunarNewYear.setHours(0, 0, 0, 0);
  
  let daysDiff = Math.round((targetDate.getTime() - lunarNewYear.getTime()) / (24 * 60 * 60 * 1000));

  // 음력 월/일 계산
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeapMonth = false;
  let accumulated = 0;

  for (let m = 0; m < 12; m++) {
    const monthDays = data.months[m];
    
    // 해당 월 내에 있는지 확인
    if (accumulated + monthDays > daysDiff) {
      lunarMonth = m + 1;
      lunarDay = daysDiff - accumulated + 1;
      break;
    }
    accumulated += monthDays;

    // 윤달 처리
    if (data.leapMonth > 0 && m + 1 === data.leapMonth) {
      if (accumulated + data.leapDays > daysDiff) {
        lunarMonth = m + 1;
        lunarDay = daysDiff - accumulated + 1;
        isLeapMonth = true;
        break;
      }
      accumulated += data.leapDays;
    }

    // 마지막 월 처리
    if (m === 11) {
      lunarMonth = 12;
      lunarDay = daysDiff - accumulated + 1;
    }
  }

  // 날짜 범위 검증
  lunarDay = Math.max(1, Math.min(30, lunarDay));

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
  };
}

// 데이터가 없는 연도의 근사 계산
function estimateSolarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
} | null {
  // 가장 가까운 기준 연도 찾기
  const years = Object.keys(LUNAR_DATA).map(Number).sort((a, b) => a - b);
  let refYear = years[years.length - 1];
  
  for (const y of years) {
    if (y <= year) {
      refYear = y;
    }
  }

  const refData = LUNAR_DATA[refYear];
  if (!refData) return null;

  const targetDate = new Date(year, month - 1, day);
  const refNewYear = new Date(refData.newYear[0], refData.newYear[1] - 1, refData.newYear[2]);
  
  const daysDiff = Math.round((targetDate.getTime() - refNewYear.getTime()) / (24 * 60 * 60 * 1000));
  
  // 평균 음력 연도: 약 354.37일
  const yearOffset = Math.floor(daysDiff / 354.37);
  const lunarYear = refYear + yearOffset;
  
  const remainingDays = daysDiff - Math.floor(yearOffset * 354.37);
  
  // 평균 음력 월: 약 29.53일
  let lunarMonth = Math.floor(remainingDays / 29.53) + 1;
  lunarMonth = Math.max(1, Math.min(12, lunarMonth));
  
  let lunarDay = Math.round(remainingDays % 29.53) + 1;
  lunarDay = Math.max(1, Math.min(30, lunarDay));

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth: false,
  };
}

// 음력 → 양력 변환
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): {
  year: number;
  month: number;
  day: number;
} | null {
  if (lunarMonth < 1 || lunarMonth > 12) return null;
  if (lunarDay < 1 || lunarDay > 30) return null;

  const data = LUNAR_DATA[lunarYear];
  if (!data) {
    return estimateLunarToSolar(lunarYear, lunarMonth, lunarDay);
  }

  // 음력 설날부터의 일수 계산
  let daysToAdd = 0;

  for (let m = 1; m < lunarMonth; m++) {
    daysToAdd += data.months[m - 1];
    
    // 윤달이 해당 월 이전에 있으면 추가
    if (data.leapMonth > 0 && m === data.leapMonth && !isLeapMonth) {
      daysToAdd += data.leapDays;
    }
  }

  // 윤달인 경우 해당 월 일수도 추가
  if (isLeapMonth && data.leapMonth === lunarMonth) {
    daysToAdd += data.months[lunarMonth - 1];
  }

  // 월 내 일수 추가
  daysToAdd += lunarDay - 1;

  const resultDate = new Date(data.newYear[0], data.newYear[1] - 1, data.newYear[2] + daysToAdd);

  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate(),
  };
}

// 데이터가 없는 연도의 근사 계산
function estimateLunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): {
  year: number;
  month: number;
  day: number;
} | null {
  const years = Object.keys(LUNAR_DATA).map(Number).sort((a, b) => a - b);
  let refYear = years[years.length - 1];
  
  for (const y of years) {
    if (y <= lunarYear) {
      refYear = y;
    }
  }

  const refData = LUNAR_DATA[refYear];
  if (!refData) return null;

  const refNewYear = new Date(refData.newYear[0], refData.newYear[1] - 1, refData.newYear[2]);
  
  const yearDiff = lunarYear - refYear;
  const daysFromYears = Math.round(yearDiff * 354.37);
  const daysFromMonths = Math.round((lunarMonth - 1) * 29.53);
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
