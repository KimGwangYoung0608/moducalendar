export interface User {
  id: string;
  name: string;
  colorIndex: number;
}

export interface Category {
  id: string;
  name: string;
  colorIndex: number;
}

export interface ScheduleFile {
  name: string;
  url: string;
  type: 'image' | 'pdf';
}

export interface Schedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  description: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  isCompleted?: boolean; // 완료 여부
  files?: ScheduleFile[]; // 첨부 파일 (이미지, PDF)
}

export interface CalendarSettings {
  users: User[];
  categories: Category[];
}

export interface LunarResult {
  solarDate: string;
  lunarDate: string;
  zodiac: string;
  age: number;
}

export interface Holiday {
  date: string;
  name: string;
  isHoliday: boolean;
}
