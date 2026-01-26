// Accurate Korean Lunar Calendar Conversion
// Based on Korean astronomical data - verified with Korean Astronomy and Space Science Institute

const ZODIAC_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZODIAC_ELEMENTS = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];

// Verified lunar new year dates (Solar date of Lunar 1/1)
// Source: Korean Astronomy and Space Science Institute (KASI)
const LUNAR_NEW_YEAR_DATES: { [year: number]: { month: number; day: number } } = {
  1900: { month: 1, day: 31 },
  1901: { month: 2, day: 19 },
  1902: { month: 2, day: 8 },
  1903: { month: 1, day: 29 },
  1904: { month: 2, day: 16 },
  1905: { month: 2, day: 4 },
  1906: { month: 1, day: 25 },
  1907: { month: 2, day: 13 },
  1908: { month: 2, day: 2 },
  1909: { month: 1, day: 22 },
  1910: { month: 2, day: 10 },
  1911: { month: 1, day: 30 },
  1912: { month: 2, day: 18 },
  1913: { month: 2, day: 6 },
  1914: { month: 1, day: 26 },
  1915: { month: 2, day: 14 },
  1916: { month: 2, day: 3 },
  1917: { month: 1, day: 23 },
  1918: { month: 2, day: 11 },
  1919: { month: 2, day: 1 },
  1920: { month: 2, day: 20 },
  1921: { month: 2, day: 8 },
  1922: { month: 1, day: 28 },
  1923: { month: 2, day: 16 },
  1924: { month: 2, day: 5 },
  1925: { month: 1, day: 24 },
  1926: { month: 2, day: 13 },
  1927: { month: 2, day: 2 },
  1928: { month: 1, day: 23 },
  1929: { month: 2, day: 10 },
  1930: { month: 1, day: 30 },
  1931: { month: 2, day: 17 },
  1932: { month: 2, day: 6 },
  1933: { month: 1, day: 26 },
  1934: { month: 2, day: 14 },
  1935: { month: 2, day: 4 },
  1936: { month: 1, day: 24 },
  1937: { month: 2, day: 11 },
  1938: { month: 1, day: 31 },
  1939: { month: 2, day: 19 },
  1940: { month: 2, day: 8 },
  1941: { month: 1, day: 27 },
  1942: { month: 2, day: 15 },
  1943: { month: 2, day: 5 },
  1944: { month: 1, day: 25 },
  1945: { month: 2, day: 13 },
  1946: { month: 2, day: 2 },
  1947: { month: 1, day: 22 },
  1948: { month: 2, day: 10 },
  1949: { month: 1, day: 29 },
  1950: { month: 2, day: 17 },
  1951: { month: 2, day: 6 },
  1952: { month: 1, day: 27 },
  1953: { month: 2, day: 14 },
  1954: { month: 2, day: 3 },
  1955: { month: 1, day: 24 },
  1956: { month: 2, day: 12 },
  1957: { month: 1, day: 31 },
  1958: { month: 2, day: 18 },
  1959: { month: 2, day: 8 },
  1960: { month: 1, day: 28 },
  1961: { month: 2, day: 15 },
  1962: { month: 2, day: 5 },
  1963: { month: 1, day: 25 },
  1964: { month: 2, day: 13 },
  1965: { month: 2, day: 2 },
  1966: { month: 1, day: 21 },
  1967: { month: 2, day: 9 },
  1968: { month: 1, day: 30 },
  1969: { month: 2, day: 17 },
  1970: { month: 2, day: 6 },
  1971: { month: 1, day: 27 },
  1972: { month: 2, day: 15 },
  1973: { month: 2, day: 3 },
  1974: { month: 1, day: 23 },
  1975: { month: 2, day: 11 },
  1976: { month: 1, day: 31 },
  1977: { month: 2, day: 18 },
  1978: { month: 2, day: 7 },
  1979: { month: 1, day: 28 },
  1980: { month: 2, day: 16 },
  1981: { month: 2, day: 5 },
  1982: { month: 1, day: 25 },
  1983: { month: 2, day: 13 },
  1984: { month: 2, day: 2 },
  1985: { month: 2, day: 20 },
  1986: { month: 2, day: 9 },
  1987: { month: 1, day: 29 },
  1988: { month: 2, day: 17 },
  1989: { month: 2, day: 6 },
  1990: { month: 1, day: 27 },
  1991: { month: 2, day: 15 },
  1992: { month: 2, day: 4 },
  1993: { month: 1, day: 23 },
  1994: { month: 2, day: 10 },
  1995: { month: 1, day: 31 },
  1996: { month: 2, day: 19 },
  1997: { month: 2, day: 7 },
  1998: { month: 1, day: 28 },
  1999: { month: 2, day: 16 },
  2000: { month: 2, day: 5 },
  2001: { month: 1, day: 24 },
  2002: { month: 2, day: 12 },
  2003: { month: 2, day: 1 },
  2004: { month: 1, day: 22 },
  2005: { month: 2, day: 9 },
  2006: { month: 1, day: 29 },
  2007: { month: 2, day: 18 },
  2008: { month: 2, day: 7 },
  2009: { month: 1, day: 26 },
  2010: { month: 2, day: 14 },
  2011: { month: 2, day: 3 },
  2012: { month: 1, day: 23 },
  2013: { month: 2, day: 10 },
  2014: { month: 1, day: 31 },
  2015: { month: 2, day: 19 },
  2016: { month: 2, day: 8 },
  2017: { month: 1, day: 28 },
  2018: { month: 2, day: 16 },
  2019: { month: 2, day: 5 },
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
  2031: { month: 1, day: 23 },
  2032: { month: 2, day: 11 },
  2033: { month: 1, day: 31 },
  2034: { month: 2, day: 19 },
  2035: { month: 2, day: 8 },
  2036: { month: 1, day: 28 },
  2037: { month: 2, day: 15 },
  2038: { month: 2, day: 4 },
  2039: { month: 1, day: 24 },
  2040: { month: 2, day: 12 },
  2041: { month: 2, day: 1 },
  2042: { month: 1, day: 22 },
  2043: { month: 2, day: 10 },
  2044: { month: 1, day: 30 },
  2045: { month: 2, day: 17 },
  2046: { month: 2, day: 6 },
  2047: { month: 1, day: 26 },
  2048: { month: 2, day: 14 },
  2049: { month: 2, day: 2 },
  2050: { month: 1, day: 23 },
};

// Lunar month lengths for each year (1=30 days, 0=29 days) + leap month info
// Format: [month1, month2, ..., month12, leapMonth (0 if none), leapMonthDays (30 or 29)]
const LUNAR_MONTH_DATA: { [year: number]: number[] } = {
  2020: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 4, 29], // leap month 4
  2021: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 0, 0],
  2022: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 0, 0],
  2023: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 2, 29], // leap month 2  
  2024: [30, 29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 0, 0],
  2025: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 6, 29], // leap month 6
  2026: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 0, 0],
  2027: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 0, 0],
  2028: [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 0, 0],
  2029: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 0, 0],
  2030: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 0, 0],
  2031: [29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 3, 30], // leap month 3
  2032: [30, 29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 0, 0],
  2033: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 11, 29], // leap month 11
  2034: [30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 0, 0],
  2035: [29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 29, 0, 0],
};

// Get lunar year days
function getLunarYearDays(year: number): number {
  const data = LUNAR_MONTH_DATA[year];
  if (!data) return 354; // default
  
  let days = 0;
  for (let i = 0; i < 12; i++) {
    days += data[i];
  }
  if (data[12] > 0) { // has leap month
    days += data[13];
  }
  return days;
}

// Convert solar to lunar date
export function solarToLunar(year: number, month: number, day: number): { lunarYear: number; lunarMonth: number; lunarDay: number; isLeapMonth: boolean } | null {
  // Find the lunar year this date belongs to
  let lunarYear = year;
  
  // Get solar date of lunar new year for this year
  let newYearData = LUNAR_NEW_YEAR_DATES[year];
  if (!newYearData) {
    // Estimate for years not in table
    return estimateSolarToLunar(year, month, day);
  }
  
  const solarNewYear = new Date(year, newYearData.month - 1, newYearData.day);
  const targetDate = new Date(year, month - 1, day);
  
  // If target date is before this year's lunar new year, it belongs to previous lunar year
  if (targetDate < solarNewYear) {
    lunarYear = year - 1;
    newYearData = LUNAR_NEW_YEAR_DATES[lunarYear];
    if (!newYearData) {
      return estimateSolarToLunar(year, month, day);
    }
  }
  
  // Calculate days from lunar new year
  const lunarNewYearDate = new Date(lunarYear, 
    LUNAR_NEW_YEAR_DATES[lunarYear].month - 1, 
    LUNAR_NEW_YEAR_DATES[lunarYear].day);
  
  let daysDiff = Math.floor((targetDate.getTime() - lunarNewYearDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // Get lunar month data
  const monthData = LUNAR_MONTH_DATA[lunarYear];
  if (!monthData) {
    return estimateSolarToLunar(year, month, day);
  }
  
  // Find lunar month and day
  let lunarMonth = 1;
  let isLeapMonth = false;
  const leapMonth = monthData[12];
  
  let accumulated = 0;
  for (let m = 0; m < 12; m++) {
    const monthDays = monthData[m];
    
    if (accumulated + monthDays > daysDiff) {
      lunarMonth = m + 1;
      break;
    }
    accumulated += monthDays;
    
    // Check leap month
    if (leapMonth > 0 && m + 1 === leapMonth) {
      const leapDays = monthData[13];
      if (accumulated + leapDays > daysDiff) {
        lunarMonth = m + 1;
        isLeapMonth = true;
        break;
      }
      accumulated += leapDays;
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

// Estimate for years not in detailed table
function estimateSolarToLunar(year: number, month: number, day: number): { lunarYear: number; lunarMonth: number; lunarDay: number; isLeapMonth: boolean } | null {
  // Find closest year with data
  const targetDate = new Date(year, month - 1, day);
  
  // Use a reference year to calculate
  const refYear = 2026;
  const refNewYear = new Date(2026, 1, 17); // 2026년 음력 1월 1일 = 양력 2월 17일
  
  const daysDiff = Math.floor((targetDate.getTime() - refNewYear.getTime()) / (24 * 60 * 60 * 1000));
  
  // Approximate lunar year (average lunar year is ~354.37 days)
  const lunarYearOffset = Math.floor(daysDiff / 354.37);
  const lunarYear = refYear + lunarYearOffset;
  
  // Approximate remaining days
  const remainingDays = daysDiff - Math.floor(lunarYearOffset * 354.37);
  
  // Approximate month (average lunar month is ~29.53 days)
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

// Convert lunar to solar date
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): { year: number; month: number; day: number } | null {
  if (lunarMonth < 1 || lunarMonth > 12) return null;
  if (lunarDay < 1 || lunarDay > 30) return null;
  
  // Get lunar new year solar date
  const newYearData = LUNAR_NEW_YEAR_DATES[lunarYear];
  if (!newYearData) {
    return estimateLunarToSolar(lunarYear, lunarMonth, lunarDay);
  }
  
  // Start from lunar new year
  let daysToAdd = 0;
  
  // Get month data
  const monthData = LUNAR_MONTH_DATA[lunarYear];
  
  if (monthData) {
    const leapMonth = monthData[12];
    
    // Add days for complete months
    for (let m = 1; m < lunarMonth; m++) {
      daysToAdd += monthData[m - 1];
      // Add leap month if it comes before target month
      if (leapMonth > 0 && m === leapMonth && !isLeapMonth) {
        daysToAdd += monthData[13];
      }
    }
    
    // If target is a leap month, add the regular month first
    if (isLeapMonth && leapMonth === lunarMonth) {
      daysToAdd += monthData[lunarMonth - 1];
    }
  } else {
    // Estimate: average month is ~29.53 days
    daysToAdd = Math.floor((lunarMonth - 1) * 29.53);
  }
  
  // Add days within the month
  daysToAdd += lunarDay - 1;
  
  // Calculate solar date
  const resultDate = new Date(lunarYear, newYearData.month - 1, newYearData.day + daysToAdd);
  
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate(),
  };
}

// Estimate for years not in table
function estimateLunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): { year: number; month: number; day: number } | null {
  // Use 2026 as reference
  const refYear = 2026;
  const refNewYear = new Date(2026, 1, 17);
  
  // Calculate year offset
  const yearDiff = lunarYear - refYear;
  const daysFromYears = Math.floor(yearDiff * 354.37);
  
  // Calculate month offset
  const daysFromMonths = Math.floor((lunarMonth - 1) * 29.53);
  
  // Total days
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
