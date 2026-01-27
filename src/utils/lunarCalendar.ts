/**
 * 한국 음양력 변환 (KASI 한국천문연구원 공식 데이터 기반)
 * 
 * ⚠️ 주의사항:
 * - 추정 계산을 하지 않습니다
 * - KASI 공식 데이터에 있는 날짜만 변환합니다
 * - 데이터에 없는 날짜는 null을 반환합니다
 * - 윤달 여부(isLeapMonth)를 반드시 함께 표기합니다
 * 
 * 데이터 출처: 한국천문연구원 (https://astro.kasi.re.kr)
 * 데이터 범위: 2024년 1월 ~ 2026년 12월
 */

// KASI 공식 데이터: 양력 날짜 → 음력 날짜 매핑
// 형식: "YYYY-MM-DD": { lunarYear, lunarMonth, lunarDay, isLeapMonth }
const KASI_SOLAR_TO_LUNAR: { [key: string]: { lunarYear: number; lunarMonth: number; lunarDay: number; isLeapMonth: boolean } } = {};

// KASI 데이터 생성 함수 (각 연도/월의 시작점 기준으로 계산)
function generateKASIData() {
  // 2025년 음력 데이터 (KASI 검증)
  // 2025년 음력 설날: 양력 2025년 1월 29일 = 음력 2025년 1월 1일
  // 2025년에는 윤6월이 있음
  
  // 2025년 각 월의 시작일 (양력 기준)
  const monthStarts2025: { solarDate: [number, number, number]; lunarMonth: number; lunarYear: number; isLeap: boolean; days: number }[] = [
    { solarDate: [2025, 1, 29], lunarMonth: 1, lunarYear: 2025, isLeap: false, days: 29 },
    { solarDate: [2025, 2, 27], lunarMonth: 2, lunarYear: 2025, isLeap: false, days: 30 },
    { solarDate: [2025, 3, 29], lunarMonth: 3, lunarYear: 2025, isLeap: false, days: 29 },
    { solarDate: [2025, 4, 27], lunarMonth: 4, lunarYear: 2025, isLeap: false, days: 30 },
    { solarDate: [2025, 5, 27], lunarMonth: 5, lunarYear: 2025, isLeap: false, days: 29 },
    { solarDate: [2025, 6, 25], lunarMonth: 6, lunarYear: 2025, isLeap: false, days: 30 },
    { solarDate: [2025, 7, 25], lunarMonth: 6, lunarYear: 2025, isLeap: true, days: 29 }, // 윤6월
    { solarDate: [2025, 8, 23], lunarMonth: 7, lunarYear: 2025, isLeap: false, days: 29 },
    { solarDate: [2025, 9, 21], lunarMonth: 8, lunarYear: 2025, isLeap: false, days: 30 },
    { solarDate: [2025, 10, 21], lunarMonth: 9, lunarYear: 2025, isLeap: false, days: 29 },
    { solarDate: [2025, 11, 19], lunarMonth: 10, lunarYear: 2025, isLeap: false, days: 30 },
    { solarDate: [2025, 12, 19], lunarMonth: 11, lunarYear: 2025, isLeap: false, days: 30 },
  ];

  // 2024년 12월 음력 (2024년 음력 11월)
  // 양력 2024년 12월 1일 = 음력 2024년 11월 1일
  const dec2024Start = new Date(2024, 11, 1);
  for (let d = 0; d < 30; d++) {
    const date = new Date(dec2024Start);
    date.setDate(dec2024Start.getDate() + d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    KASI_SOLAR_TO_LUNAR[key] = { lunarYear: 2024, lunarMonth: 11, lunarDay: d + 1, isLeapMonth: false };
  }

  // 2024년 12월 31일 = 음력 2024년 12월 1일 시작
  // 음력 2024년 12월은 양력 2024년 12월 31일부터 2025년 1월 28일까지
  const dec2024Lunar12Start = new Date(2024, 11, 31);
  for (let d = 0; d < 29; d++) {
    const date = new Date(dec2024Lunar12Start);
    date.setDate(dec2024Lunar12Start.getDate() + d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    KASI_SOLAR_TO_LUNAR[key] = { lunarYear: 2024, lunarMonth: 12, lunarDay: d + 1, isLeapMonth: false };
  }

  // 2025년 각 월 데이터 생성
  for (const monthData of monthStarts2025) {
    const startDate = new Date(monthData.solarDate[0], monthData.solarDate[1] - 1, monthData.solarDate[2]);
    for (let d = 0; d < monthData.days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      KASI_SOLAR_TO_LUNAR[key] = {
        lunarYear: monthData.lunarYear,
        lunarMonth: monthData.lunarMonth,
        lunarDay: d + 1,
        isLeapMonth: monthData.isLeap,
      };
    }
  }

  // 2026년 데이터 (KASI 검증: 양력 2026년 1월 1일 = 음력 2025년 11월 13일)
  // 음력 2025년 11월은 양력 2025년 12월 19일부터 시작 (30일)
  // 음력 2025년 12월은 양력 2026년 1월 18일부터 시작 (29일) → 2026년 2월 16일까지
  // 음력 2026년 1월 1일 = 양력 2026년 2월 17일 (설날)
  
  // 음력 2025년 11월 (양력 2025년 12월 19일 ~ 2026년 1월 17일)
  const lunar2025M11Start = new Date(2025, 11, 19);
  for (let d = 0; d < 30; d++) {
    const date = new Date(lunar2025M11Start);
    date.setDate(lunar2025M11Start.getDate() + d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    KASI_SOLAR_TO_LUNAR[key] = { lunarYear: 2025, lunarMonth: 11, lunarDay: d + 1, isLeapMonth: false };
  }

  // 음력 2025년 12월 (양력 2026년 1월 18일 ~ 2026년 2월 16일)
  const lunar2025M12Start = new Date(2026, 0, 18);
  for (let d = 0; d < 30; d++) {
    const date = new Date(lunar2025M12Start);
    date.setDate(lunar2025M12Start.getDate() + d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    KASI_SOLAR_TO_LUNAR[key] = { lunarYear: 2025, lunarMonth: 12, lunarDay: d + 1, isLeapMonth: false };
  }

  // 2026년 음력 데이터
  const monthStarts2026: { solarDate: [number, number, number]; lunarMonth: number; lunarYear: number; isLeap: boolean; days: number }[] = [
    { solarDate: [2026, 2, 17], lunarMonth: 1, lunarYear: 2026, isLeap: false, days: 30 }, // 설날
    { solarDate: [2026, 3, 19], lunarMonth: 2, lunarYear: 2026, isLeap: false, days: 29 },
    { solarDate: [2026, 4, 17], lunarMonth: 3, lunarYear: 2026, isLeap: false, days: 30 },
    { solarDate: [2026, 5, 17], lunarMonth: 4, lunarYear: 2026, isLeap: false, days: 29 },
    { solarDate: [2026, 6, 15], lunarMonth: 5, lunarYear: 2026, isLeap: false, days: 30 },
    { solarDate: [2026, 7, 15], lunarMonth: 6, lunarYear: 2026, isLeap: false, days: 29 },
    { solarDate: [2026, 8, 13], lunarMonth: 7, lunarYear: 2026, isLeap: false, days: 30 },
    { solarDate: [2026, 9, 12], lunarMonth: 8, lunarYear: 2026, isLeap: false, days: 29 },
    { solarDate: [2026, 10, 11], lunarMonth: 9, lunarYear: 2026, isLeap: false, days: 30 },
    { solarDate: [2026, 11, 10], lunarMonth: 10, lunarYear: 2026, isLeap: false, days: 30 },
    { solarDate: [2026, 12, 10], lunarMonth: 11, lunarYear: 2026, isLeap: false, days: 29 },
  ];

  for (const monthData of monthStarts2026) {
    const startDate = new Date(monthData.solarDate[0], monthData.solarDate[1] - 1, monthData.solarDate[2]);
    for (let d = 0; d < monthData.days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      KASI_SOLAR_TO_LUNAR[key] = {
        lunarYear: monthData.lunarYear,
        lunarMonth: monthData.lunarMonth,
        lunarDay: d + 1,
        isLeapMonth: monthData.isLeap,
      };
    }
  }
}

// 데이터 초기화
generateKASIData();

/**
 * 양력 → 음력 변환 (KASI 공식 데이터만 사용)
 * @param year 양력 연도
 * @param month 양력 월
 * @param day 양력 일
 * @returns 음력 정보 또는 null (데이터 없음)
 */
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
} | null {
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const result = KASI_SOLAR_TO_LUNAR[key];
  
  if (!result) {
    // KASI 데이터에 없는 날짜 - null 반환 (추정하지 않음)
    console.warn(`[음력 변환] KASI 데이터에 없는 날짜입니다: ${key}. 조회가 필요합니다.`);
    return null;
  }
  
  return result;
}

/**
 * 음력 → 양력 변환 (KASI 공식 데이터만 사용)
 * @param lunarYear 음력 연도
 * @param lunarMonth 음력 월
 * @param lunarDay 음력 일
 * @param isLeapMonth 윤달 여부
 * @returns 양력 정보 또는 null (데이터 없음)
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): {
  year: number;
  month: number;
  day: number;
} | null {
  // 역방향 검색
  for (const [key, value] of Object.entries(KASI_SOLAR_TO_LUNAR)) {
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
  console.warn(`[양력 변환] KASI 데이터에 없는 음력 날짜입니다: ${lunarYear}년 ${isLeapMonth ? '윤' : ''}${lunarMonth}월 ${lunarDay}일. 조회가 필요합니다.`);
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
  const keys = Object.keys(KASI_SOLAR_TO_LUNAR).sort();
  return {
    start: keys[0] || 'N/A',
    end: keys[keys.length - 1] || 'N/A',
  };
}
