import { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarDays, Plus, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { ScheduleModal } from '@/components/calendar/ScheduleModal';
import { SettingsModal } from '@/components/calendar/SettingsModal';
import { ScheduleList } from '@/components/calendar/ScheduleList';
import { LunarConverter } from '@/components/calendar/LunarConverter';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import { getKoreanHolidays, getHolidayForDate } from '@/utils/koreanHolidays';
import { solarToLunar } from '@/utils/lunarCalendar';

const Index = () => {
  const {
    settings,
    schedules,
    isLoading,
    lastSync,
    updateSettings,
    addSchedule,
    deleteSchedule,
    refreshData,
  } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // For schedule modal auto-selection
  const [scheduleDefaultUserId, setScheduleDefaultUserId] = useState<string | null>(null);
  const [scheduleDefaultCategoryId, setScheduleDefaultCategoryId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const scheduleListRef = useRef<HTMLDivElement>(null);

  // Get holidays for current year and adjacent years
  const holidays = useMemo(() => {
    const year = currentDate.getFullYear();
    return [
      ...getKoreanHolidays(year - 1),
      ...getKoreanHolidays(year),
      ...getKoreanHolidays(year + 1),
    ];
  }, [currentDate]);

  // Schedules are always visible (no category filter - show all schedules)
  const filteredSchedules = useMemo(() => {
    return schedules;
  }, [schedules]);

  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSchedules.filter(s => s.date === selectedDate);
  }, [filteredSchedules, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodaySchedule = () => {
    const today = new Date();
    setCurrentDate(today);
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    
    // Scroll to schedule list after a short delay
    setTimeout(() => {
      scheduleListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    // Only scroll if there are schedules on this date
    const dateSchedules = schedules.filter(s => s.date === date);
    if (dateSchedules.length > 0) {
      setTimeout(() => {
        scheduleListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleAddSchedule = (data: {
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  }) => {
    if (!selectedDate) return;

    addSchedule({
      ...data,
      date: selectedDate,
    });
  };

  const handleAddFromLunar = (date: string, title: string, isLunar: boolean, lunarMonth: number, lunarDay: number, yearsToAdd: number[] = []) => {
    // Find or use default birthday category
    const birthdayCategory = settings.categories.find(c => c.name === '생일') || settings.categories[0];
    
    // Add birthday for each year provided
    if (yearsToAdd.length > 0) {
      yearsToAdd.forEach(year => {
        addSchedule({
          title: `🎂 ${title}`,
          description: isLunar ? `음력 ${lunarMonth}월 ${lunarDay}일 생일` : '양력 생일',
          date: date.replace(/^\d{4}/, String(year)),
          userId: settings.users[0]?.id ?? '',
          categoryId: birthdayCategory?.id ?? '',
        });
      });
    } else {
      addSchedule({
        title: `🎂 ${title}`,
        description: isLunar ? `음력 ${lunarMonth}월 ${lunarDay}일 생일` : '양력 생일',
        date,
        userId: settings.users[0]?.id ?? '',
        categoryId: birthdayCategory?.id ?? '',
      });
    }
  };

  // Handler for user click - set default for schedule modal
  const handleUserClickForSchedule = (userId: string) => {
    setScheduleDefaultUserId(userId);
  };

  // Handler for category click - set default for schedule modal  
  const handleCategoryClickForSchedule = (categoryId: string) => {
    setScheduleDefaultCategoryId(categoryId);
  };

  const formatSelectedDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const lunar = solarToLunar(year, month, day);
    const solarStr = `${year}년 ${month}월 ${day}일`;
    if (lunar) {
      return `${solarStr} (음력 ${lunar.lunarMonth}월 ${lunar.lunarDay}일)`;
    }
    return solarStr;
  };

  // Get holiday info for selected date
  const getSelectedDateHoliday = (dateStr: string) => {
    return getHolidayForDate(dateStr, holidays);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* App Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">팀 공유 캘린더</h1>
              <p className="text-sm text-muted-foreground">팀원들과 스케줄을 공유하세요</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>동기화 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Cloud className="h-4 w-4" />
                <span>실시간 연결됨</span>
              </div>
            )}
            {lastSync && (
              <span className="text-xs text-muted-foreground">
                {lastSync.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Calendar Header with filters */}
        <CalendarHeader
          currentDate={currentDate}
          users={settings.users}
          categories={settings.categories}
          selectedUserId={selectedUserId}
          selectedCategoryId={selectedCategoryId}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodaySchedule={handleTodaySchedule}
          onUserSelect={setSelectedUserId}
          onCategorySelect={setSelectedCategoryId}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onUserClickForSchedule={handleUserClickForSchedule}
          onCategoryClickForSchedule={handleCategoryClickForSchedule}
        />

        {/* Calendar Grid */}
        <div className="mt-4">
          <CalendarGrid
            currentDate={currentDate}
            schedules={filteredSchedules}
            users={settings.users}
            categories={settings.categories}
            holidays={holidays}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Selected Date Panel */}
        {selectedDate && (
          <div ref={scheduleListRef} className="mt-6 bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{formatSelectedDate(selectedDate)}</h3>
                {getSelectedDateHoliday(selectedDate) && (
                  <p className="text-sm text-destructive font-medium mt-1">
                    🇰🇷 {getSelectedDateHoliday(selectedDate)?.name}
                  </p>
                )}
              </div>
              <Button onClick={() => setIsScheduleModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                스케줄 추가
              </Button>
            </div>
            <ScheduleList
              schedules={selectedDateSchedules}
              users={settings.users}
              categories={settings.categories}
              onDelete={deleteSchedule}
            />
          </div>
        )}

        {/* Lunar Converter */}
        <LunarConverter onAddToCalendar={handleAddFromLunar} />

        {/* Modals */}
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={handleAddSchedule}
          date={selectedDate ?? ''}
          users={settings.users}
          categories={settings.categories}
          selectedUserId={scheduleDefaultUserId || selectedUserId}
          selectedCategoryId={scheduleDefaultCategoryId || selectedCategoryId}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onSave={updateSettings}
        />
      </div>
    </div>
  );
};

export default Index;
