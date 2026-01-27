/**
 * 한국 음양력 변환 (KARI 한국천문연구원 공식 데이터 기반)
 * 
 * 데이터 출처: korean-lunar-calendar 라이브러리 (KARI 데이터)
 * 데이터 범위: 1000년 1월 1일 ~ 2050년 11월 18일 (음력)
 *              1000년 2월 13일 ~ 2050년 12월 31일 (양력)
 * 
 * ⚠️ 핵심 원칙:
 * - KARI(한국천문연구원) 공식 데이터만 사용
 * - 윤달 여부(isLeapMonth)를 반드시 함께 표기
 * - 범위 밖의 날짜는 null 반환
 */

// @ts-ignore - CommonJS module
import KoreanLunarCalendar from 'korean-lunar-calendar';

// 싱글톤 인스턴스
const calendar = new KoreanLunarCalendar();

/**
 * 양력 → 음력 변환 (KARI 공식 데이터)
 * 
 * @param year 양력 연도 (1000-2050)
 * @param month 양력 월 (1-12)
 * @param day 양력 일
 * @returns 음력 정보 또는 null (범위 밖)
 */
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
} | null {
  // 범위 체크: 1000-02-13 ~ 2050-12-31
  if (year < 1000 || year > 2050) {
    console.warn(`[음력 변환] 범위 밖의 날짜입니다: ${year}-${month}-${day}. 지원 범위: 1000-2050년`);
    return null;
  }
  
  const isValid = calendar.setSolarDate(year, month, day);
  
  if (!isValid) {
    console.warn(`[음력 변환] 유효하지 않은 날짜입니다: ${year}-${month}-${day}`);
    return null;
  }
  
  const lunar = calendar.getLunarCalendar();
  
  return {
    lunarYear: lunar.year,
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    isLeapMonth: lunar.intercalation,
  };
}

/**
 * 음력 → 양력 변환 (KARI 공식 데이터)
 * 
 * @param lunarYear 음력 연도 (1000-2050)
 * @param lunarMonth 음력 월 (1-12)
 * @param lunarDay 음력 일
 * @param isLeapMonth 윤달 여부 (반드시 명시!)
 * @returns 양력 정보 또는 null (범위 밖)
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): {
  year: number;
  month: number;
  day: number;
} | null {
  // 범위 체크: 1000-01-01 ~ 2050-11-18
  if (lunarYear < 1000 || lunarYear > 2050) {
    const leapText = isLeapMonth ? '윤' : '';
    console.warn(`[양력 변환] 범위 밖의 음력 날짜입니다: ${lunarYear}년 ${leapText}${lunarMonth}월 ${lunarDay}일. 지원 범위: 1000-2050년`);
    return null;
  }
  
  const isValid = calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth);
  
  if (!isValid) {
    const leapText = isLeapMonth ? '윤' : '';
    console.warn(`[양력 변환] 유효하지 않은 음력 날짜입니다: ${lunarYear}년 ${leapText}${lunarMonth}월 ${lunarDay}일`);
    return null;
  }
  
  const solar = calendar.getSolarCalendar();
  
  return {
    year: solar.year,
    month: solar.month,
    day: solar.day,
  };
}

/**
 * 간지(干支) 정보 가져오기
 */
export function getGapja(year: number, month: number, day: number): {
  year: string;
  month: string;
  day: string;
  intercalation: string;
} | null {
  const isValid = calendar.setSolarDate(year, month, day);
  if (!isValid) return null;
  
  return calendar.getKoreanGapja();
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
 * KARI 데이터 범위 확인
 * @returns 데이터가 있는 날짜 범위
 */
export function getDataRange(): { 
  solar: { start: string; end: string };
  lunar: { start: string; end: string };
} {
  return {
    solar: { start: '1000-02-13', end: '2050-12-31' },
    lunar: { start: '1000-01-01', end: '2050-11-18' },
  };
}

/**
 * 특정 날짜에 데이터가 있는지 확인
 */
export function hasData(year: number, month: number, day: number): boolean {
  if (year < 1000 || year > 2050) return false;
  return calendar.setSolarDate(year, month, day);
}
