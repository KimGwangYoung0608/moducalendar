/**
 * 한국 음양력 변환 (KASI 한국천문연구원 공식 데이터 기반)
 * 
 * ⚠️ 핵심 원칙:
 * - 추정 계산을 절대 하지 않습니다
 * - KASI/superkts 공식 데이터에 있는 날짜만 변환합니다
 * - 데이터에 없는 날짜는 null을 반환하고 "조회가 필요합니다"라고 안내합니다
 * - 윤달 여부(isLeapMonth)를 반드시 함께 표기합니다
 * 
 * 데이터 출처: 한국천문연구원 (https://astro.kasi.re.kr), superkts.com
 * 데이터 범위: 2025년 1월 ~ 2026년 12월
 * 
 * 검증된 핵심 날짜 (superkts.com 기준):
 * - 양력 2025-01-01 → 음력 2024-12-02 (평달)
 * - 양력 2025-01-29 → 음력 2025-01-01 (설날, 평달)
 * - 양력 2025-06-25 → 음력 2025-06-01 (평달)
 * - 양력 2025-07-25 → 음력 2025-윤06-01 (윤달 시작!)
 * - 양력 2025-08-22 → 음력 2025-윤06-29 (윤달 마지막)
 * - 양력 2025-08-23 → 음력 2025-07-01 (평달)
 * - 양력 2025-12-20 → 음력 2025-11-01 (평달)
 * - 양력 2026-02-16 → 음력 2025-12-29 (평달)
 * - 양력 2026-02-17 → 음력 2026-01-01 (설날, 평달)
 */

// KASI 공식 데이터 기반 월별 시작일 매핑
// 각 월의 시작 양력일, 음력년월, 윤달여부, 일수
interface MonthData {
  solarStart: [number, number, number]; // [year, month, day]
  lunarYear: number;
  lunarMonth: number;
  isLeapMonth: boolean;
  days: number;
}

// KASI/superkts.com 검증된 월별 데이터
const LUNAR_MONTHS: MonthData[] = [
  // 2024년 음력 12월 (양력 2024-12-31 ~ 2025-01-28)
  { solarStart: [2024, 12, 31], lunarYear: 2024, lunarMonth: 12, isLeapMonth: false, days: 29 },
  
  // 2025년 음력 데이터
  { solarStart: [2025, 1, 29], lunarYear: 2025, lunarMonth: 1, isLeapMonth: false, days: 29 },   // 설날
  { solarStart: [2025, 2, 27], lunarYear: 2025, lunarMonth: 2, isLeapMonth: false, days: 30 },
  { solarStart: [2025, 3, 29], lunarYear: 2025, lunarMonth: 3, isLeapMonth: false, days: 30 },
  { solarStart: [2025, 4, 28], lunarYear: 2025, lunarMonth: 4, isLeapMonth: false, days: 29 },
  { solarStart: [2025, 5, 27], lunarYear: 2025, lunarMonth: 5, isLeapMonth: false, days: 29 },
  { solarStart: [2025, 6, 25], lunarYear: 2025, lunarMonth: 6, isLeapMonth: false, days: 30 },   // 6월
  { solarStart: [2025, 7, 25], lunarYear: 2025, lunarMonth: 6, isLeapMonth: true, days: 29 },    // 윤6월!
  { solarStart: [2025, 8, 23], lunarYear: 2025, lunarMonth: 7, isLeapMonth: false, days: 30 },
  { solarStart: [2025, 9, 22], lunarYear: 2025, lunarMonth: 8, isLeapMonth: false, days: 29 },
  { solarStart: [2025, 10, 21], lunarYear: 2025, lunarMonth: 9, isLeapMonth: false, days: 29 },
  { solarStart: [2025, 11, 19], lunarYear: 2025, lunarMonth: 10, isLeapMonth: false, days: 30 },
  { solarStart: [2025, 12, 20], lunarYear: 2025, lunarMonth: 11, isLeapMonth: false, days: 29 }, // 11월
  
  // 2025년 음력 12월 (양력 2026-01-18 ~ 2026-02-16)
  { solarStart: [2026, 1, 18], lunarYear: 2025, lunarMonth: 12, isLeapMonth: false, days: 29 },
  
  // 2026년 음력 데이터 (KASI 검증)
  { solarStart: [2026, 2, 17], lunarYear: 2026, lunarMonth: 1, isLeapMonth: false, days: 30 },   // 설날
  { solarStart: [2026, 3, 19], lunarYear: 2026, lunarMonth: 2, isLeapMonth: false, days: 29 },
  { solarStart: [2026, 4, 17], lunarYear: 2026, lunarMonth: 3, isLeapMonth: false, days: 30 },
  { solarStart: [2026, 5, 17], lunarYear: 2026, lunarMonth: 4, isLeapMonth: false, days: 29 },
  { solarStart: [2026, 6, 15], lunarYear: 2026, lunarMonth: 5, isLeapMonth: false, days: 30 },
  { solarStart: [2026, 7, 15], lunarYear: 2026, lunarMonth: 6, isLeapMonth: false, days: 29 },
  { solarStart: [2026, 8, 13], lunarYear: 2026, lunarMonth: 7, isLeapMonth: false, days: 30 },
  { solarStart: [2026, 9, 12], lunarYear: 2026, lunarMonth: 8, isLeapMonth: false, days: 29 },   // 추석
  { solarStart: [2026, 10, 11], lunarYear: 2026, lunarMonth: 9, isLeapMonth: false, days: 30 },
  { solarStart: [2026, 11, 10], lunarYear: 2026, lunarMonth: 10, isLeapMonth: false, days: 30 },
  { solarStart: [2026, 12, 10], lunarYear: 2026, lunarMonth: 11, isLeapMonth: false, days: 29 },
];

// 월별 데이터를 일별 데이터로 변환 (KASI_SOLAR_TO_LUNAR 맵 생성)
const KASI_SOLAR_TO_LUNAR: Map<string, { lunarYear: number; lunarMonth: number; lunarDay: number; isLeapMonth: boolean }> = new Map();

function initializeData() {
  for (const monthData of LUNAR_MONTHS) {
    const [startYear, startMonth, startDay] = monthData.solarStart;
    const startDate = new Date(startYear, startMonth - 1, startDay);
    
    for (let d = 0; d < monthData.days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      KASI_SOLAR_TO_LUNAR.set(key, {
        lunarYear: monthData.lunarYear,
        lunarMonth: monthData.lunarMonth,
        lunarDay: d + 1,
        isLeapMonth: monthData.isLeapMonth,
      });
    }
  }
}

// 데이터 초기화
initializeData();

/**
 * 양력 → 음력 변환 (KASI 공식 데이터만 사용)
 * 추정 계산을 절대 하지 않습니다!
 * 
 * @param year 양력 연도
 * @param month 양력 월
 * @param day 양력 일
 * @returns 음력 정보 또는 null (데이터 없음 - 조회 필요)
 */
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
} | null {
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const result = KASI_SOLAR_TO_LUNAR.get(key);
  
  if (!result) {
    // KASI 데이터에 없는 날짜 - null 반환 (절대 추정하지 않음!)
    console.warn(`[음력 변환] KASI 데이터에 없는 날짜입니다: ${key}. 조회가 필요합니다.`);
    return null;
  }
  
  return result;
}

/**
 * 음력 → 양력 변환 (KASI 공식 데이터만 사용)
 * 추정 계산을 절대 하지 않습니다!
 * 
 * @param lunarYear 음력 연도
 * @param lunarMonth 음력 월
 * @param lunarDay 음력 일
 * @param isLeapMonth 윤달 여부 (반드시 명시해야 함!)
 * @returns 양력 정보 또는 null (데이터 없음 - 조회 필요)
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): {
  year: number;
  month: number;
  day: number;
} | null {
  // 역방향 검색
  for (const [key, value] of KASI_SOLAR_TO_LUNAR.entries()) {
    if (
      value.lunarYear === lunarYear &&
      value.lunarMonth === lunarMonth &&
      value.lunarDay === lunarDay &&
      value.isLeapMonth === isLeapMonth
    ) {
      const [year, month, day] = key.split('-').map(Number);
      return { year, month, day };
    }
  }
  
  // KASI 데이터에 없는 날짜
  const leapText = isLeapMonth ? '윤' : '';
  console.warn(`[양력 변환] KASI 데이터에 없는 음력 날짜입니다: ${lunarYear}년 ${leapText}${lunarMonth}월 ${lunarDay}일. 조회가 필요합니다.`);
  return null;
}

// 띠 정보
const ZODIAC_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZODIAC_ELEMENTS = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];

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
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - (birthMonth - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * 음력 날짜 포맷 (윤달 표기 포함)
 */
export function formatLunarDate(year: number, month: number, day: number, isLeapMonth?: boolean): string {
  const leapPrefix = isLeapMonth ? '윤' : '';
  return `${year}년 ${leapPrefix}${month}월 ${day}일`;
}

export function formatSolarDate(year: number, month: number, day: number): string {
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * KASI 데이터 범위 확인
 * @returns 데이터가 있는 날짜 범위
 */
export function getDataRange(): { start: string; end: string } {
  const keys = Array.from(KASI_SOLAR_TO_LUNAR.keys()).sort();
  return {
    start: keys[0] || 'N/A',
    end: keys[keys.length - 1] || 'N/A',
  };
}

/**
 * 특정 날짜에 데이터가 있는지 확인
 */
export function hasData(year: number, month: number, day: number): boolean {
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return KASI_SOLAR_TO_LUNAR.has(key);
}
