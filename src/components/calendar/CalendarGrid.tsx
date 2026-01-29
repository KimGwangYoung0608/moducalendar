import { useMemo } from 'react';
import { Schedule, User, Category, Holiday } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { solarToLunar } from '@/utils/lunarCalendar';
import { colorClasses, getColorClass } from '@/lib/colors';

interface CalendarGridProps {
  currentDate: Date;
  schedules: Schedule[];
  users: User[];
  categories: Category[];
  holidays: Holiday[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarGrid({
  currentDate,
  schedules,
  users,
  categories,
  holidays,
  selectedDate,
  onDateSelect,
}: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getSchedulesForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return schedules.filter(s => s.date === dateStr);
  };

  const getHolidayForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return colorClasses[0];
    return getColorClass(category.colorIndex);
  };

  const getUserColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return colorClasses[0];
    return getColorClass(user.colorIndex);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name ?? '';
  };

  const getLunarInfo = (date: Date) => {
    const lunar = solarToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
    if (!lunar) return null;
    return {
      day: lunar.lunarDay,
      isLeapMonth: lunar.isLeapMonth,
      month: lunar.lunarMonth,
    };
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "py-3 text-center text-sm font-medium",
              index === 0 && "text-destructive",
              index === 6 && "text-primary"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const daySchedules = getSchedulesForDate(date);
          const holiday = getHolidayForDate(date);
          const lunarInfo = getLunarInfo(date);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayOfWeek = date.getDay();
          const isHoliday = holiday?.isHoliday || dayOfWeek === 0;

          return (
            <div
              key={index}
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                "min-h-[100px] p-2 border-t border-l first:border-l-0 cursor-pointer transition-colors",
                "[&:nth-child(7n+1)]:border-l-0",
                isCurrentMonth ? "bg-card" : "bg-muted/30",
                isToday && "bg-[hsl(var(--calendar-today))]",
                isSelected && "bg-[hsl(var(--calendar-selected))] ring-2 ring-primary ring-inset",
                !isSelected && "hover:bg-[hsl(var(--calendar-hover))]"
              )}
            >
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isCurrentMonth && isHoliday && "text-destructive",
                    isCurrentMonth && dayOfWeek === 6 && !isHoliday && "text-primary",
                    isToday && "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                  )}
                >
                  {date.getDate()}
                </div>
                {lunarInfo && isCurrentMonth && (
                  <span className="text-[10px] text-muted-foreground">
                    {lunarInfo.isLeapMonth ? '윤' : ''}
                    {lunarInfo.day === 1 ? `${lunarInfo.month}.1` : lunarInfo.day}
                  </span>
                )}
              </div>

              {/* Holiday name */}
              {holiday && isCurrentMonth && (
                <div className="text-[10px] text-destructive truncate font-medium">
                  {holiday.name}
                </div>
              )}

              {/* Schedule indicators */}
              <div className="space-y-0.5 mt-1">
                {daySchedules.slice(0, 3).map((schedule) => {
                  const isBirthday = schedule.title.includes('생일') || schedule.title.startsWith('🎂');
                  const isCompleted = schedule.isCompleted ?? false;
                  const hasCategoryColor = schedule.categoryId && schedule.categoryId !== '';
                  return (
                    <div
                      key={schedule.id}
                      className={cn(
                        "flex items-center gap-1 text-[10px]",
                        isCompleted && "opacity-60"
                      )}
                    >
                      {/* 카테고리 색상 동그라미 */}
                      <span 
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          hasCategoryColor ? getCategoryColor(schedule.categoryId) : "bg-gray-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-white px-1 py-0.5 rounded truncate flex-1",
                          schedule.userId ? getUserColor(schedule.userId) : "bg-gray-500",
                          isCompleted && "line-through"
                        )}
                      >
                        {isBirthday ? '🎂 ' : ''}{schedule.title.replace(/^🎂\s*/, '')}
                      </span>
                    </div>
                  );
                })}
                {daySchedules.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    +{daySchedules.length - 3}개 더보기
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
