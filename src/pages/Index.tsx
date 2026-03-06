import { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarDays, Plus, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { ScheduleModal } from '@/components/calendar/ScheduleModal';
import { SettingsModal } from '@/components/calendar/SettingsModal';
import { ScheduleList } from '@/components/calendar/ScheduleList';
import { LunarConverter } from '@/components/calendar/LunarConverter';
import { GonguList } from '@/components/calendar/GonguList';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import { getKoreanHolidays, getHolidayForDate } from '@/utils/koreanHolidays';
import { solarToLunar } from '@/utils/lunarCalendar';
import { Schedule, ScheduleFile } from '@/types/calendar';

// Helper function to get last Monday of a month
const getLastMondayOfMonth = (year: number, month: number): Date => {
  const lastDay = new Date(year, month + 1, 0); // Last day of month
  const lastDayOfWeek = lastDay.getDay();
  // Calculate days to subtract to get to Monday (day 1)
  // If lastDayOfWeek is 0 (Sunday), we need to go back 6 days
  // If lastDayOfWeek is 1 (Monday), we're already there
  // If lastDayOfWeek is 2 (Tuesday), we need to go back 1 day, etc.
  const daysToSubtract = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  const lastMonday = new Date(year, month + 1, 0 - daysToSubtract);
  return lastMonday;
};

// Helper function to get last day of a month
const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0); // Last day of month
};

// Helper function to add days to a date
const addDays = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Index = () => {
  const {
    settings,
    schedules,
    isLoading,
    lastSync,
    updateSettings,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleComplete,
    refreshData,
  } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  // For schedule modal auto-selection
  const [scheduleDefaultUserId, setScheduleDefaultUserId] = useState<string | null>(null);
  const [scheduleDefaultCategoryId, setScheduleDefaultCategoryId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const scheduleListRef = useRef<HTMLDivElement>(null);

  // Track if monthly settlement schedules have been initialized
  const settlementInitializedRef = useRef(false);
  const chacolabInitializedRef = useRef(false);
  const isCheckingRef = useRef(false);

  // 후불제 정산정리 스케줄 생성 - 앱 로드 시 한 번만 실행
  useEffect(() => {
    // localStorage를 사용하여 영구적으로 추적 (오늘 날짜 기준)
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `settlement_init_${today}`;
    
    // 이미 오늘 초기화했으면 스킵
    if (localStorage.getItem(storageKey) === 'done') {
      settlementInitializedRef.current = true;
      return;
    }

    // 로딩 중이거나, 이미 초기화했거나, 현재 체크 중이면 스킵
    if (settlementInitializedRef.current || isLoading || isCheckingRef.current) {
      return;
    }

    // 스케줄이 아직 로드되지 않았으면 대기
    if (!Array.isArray(schedules)) {
      return;
    }

    const checkAndAddMonthlySettlement = async () => {
      // 동시 실행 방지
      if (isCheckingRef.current || settlementInitializedRef.current) {
        return;
      }
      isCheckingRef.current = true;

      try {
        const year = new Date().getFullYear();
        const schedulesToAdd: Array<{date: string, title: string, description: string}> = [];
        
        // 현재 스케줄 스냅샷
        const currentSchedules = [...schedules];
        
        // 현재 연도와 다음 연도 체크
        for (let y = year; y <= year + 1; y++) {
          for (let m = 0; m < 12; m++) {
            const lastMonday = getLastMondayOfMonth(y, m);
            const dateStr = `${lastMonday.getFullYear()}-${String(lastMonday.getMonth() + 1).padStart(2, '0')}-${String(lastMonday.getDate()).padStart(2, '0')}`;
            
            // 해당 날짜에 후불제 정산정리가 이미 있는지 체크
            const existingSchedule = currentSchedules.find(s => 
              s.date === dateStr && s.title.includes('후불제 정산정리')
            );
            
            if (!existingSchedule) {
              // 이미 대기열에 있는지 확인
              const alreadyQueued = schedulesToAdd.find(s => s.date === dateStr);
              if (!alreadyQueued) {
                schedulesToAdd.push({
                  date: dateStr,
                  title: '✨️후불제 정산정리',
                  description: `${lastMonday.getFullYear()}년 ${lastMonday.getMonth() + 1}월 마지막 주 월요일 정산`,
                });
              }
            }
          }
        }

        // 누락된 스케줄 추가 (사용자/카테고리 없이)
        if (schedulesToAdd.length > 0) {
          for (const schedule of schedulesToAdd) {
            await new Promise(resolve => setTimeout(resolve, 150));
            addSchedule({
              ...schedule,
              userId: '',
              categoryId: '',
            });
          }
        }
        
        // 초기화 완료 표시
        settlementInitializedRef.current = true;
        localStorage.setItem(storageKey, 'done');
        
        // 오래된 키 정리 (어제 이전 키 삭제)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const oldKey = `settlement_init_${yesterday.toISOString().split('T')[0]}`;
        localStorage.removeItem(oldKey);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // 스케줄 배열이 존재할 때만 실행 (3초 대기 후)
    if (Array.isArray(schedules)) {
      const timeoutId = setTimeout(checkAndAddMonthlySettlement, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, schedules, addSchedule]);

  // 차코랩불량 사진전송 스케줄 생성 - 매월 말일, 사용자: 이승진, 카테고리: 업무
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `chacolab_init_${today}`;
    
    if (localStorage.getItem(storageKey) === 'done') {
      chacolabInitializedRef.current = true;
      return;
    }

    if (chacolabInitializedRef.current || isLoading || isCheckingRef.current) {
      return;
    }

    if (!Array.isArray(schedules)) {
      return;
    }

    const checkAndAddChacolabSchedule = async () => {
      if (isCheckingRef.current || chacolabInitializedRef.current) {
        return;
      }
      isCheckingRef.current = true;

      try {
        const year = new Date().getFullYear();
        const schedulesToAdd: Array<{date: string, title: string, description: string, userId: string, categoryId: string}> = [];
        
        const currentSchedules = [...schedules];
        
        // 사용자 "이승진" 찾기
        const userSeungjin = settings.users.find(u => u.name === '이승진');
        // 카테고리 "업무" 찾기
        const categoryWork = settings.categories.find(c => c.name === '업무');
        
        // 사용자나 카테고리가 없으면 스킵
        if (!userSeungjin || !categoryWork) {
          chacolabInitializedRef.current = true;
          localStorage.setItem(storageKey, 'done');
          isCheckingRef.current = false;
          return;
        }
        
        // 현재 연도와 다음 연도 체크
        for (let y = year; y <= year + 1; y++) {
          for (let m = 0; m < 12; m++) {
            const lastDay = getLastDayOfMonth(y, m);
            const dateStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
            
            // 해당 날짜에 차코랩불량 사진전송이 이미 있는지 체크
            const existingSchedule = currentSchedules.find(s => 
              s.date === dateStr && s.title.includes('차코랩불량 사진전송')
            );
            
            if (!existingSchedule) {
              const alreadyQueued = schedulesToAdd.find(s => s.date === dateStr);
              if (!alreadyQueued) {
                schedulesToAdd.push({
                  date: dateStr,
                  title: '✨️차코랩불량 사진전송',
                  description: `${lastDay.getFullYear()}년 ${lastDay.getMonth() + 1}월 말일 사진 전송`,
                  userId: userSeungjin.id,
                  categoryId: categoryWork.id,
                });
              }
            }
          }
        }

        // 누락된 스케줄 추가
        if (schedulesToAdd.length > 0) {
          for (const schedule of schedulesToAdd) {
            await new Promise(resolve => setTimeout(resolve, 150));
            addSchedule(schedule);
          }
        }
        
        chacolabInitializedRef.current = true;
        localStorage.setItem(storageKey, 'done');
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const oldKey = `chacolab_init_${yesterday.toISOString().split('T')[0]}`;
        localStorage.removeItem(oldKey);
      } finally {
        isCheckingRef.current = false;
      }
    };

    if (Array.isArray(schedules) && settings.users.length > 0 && settings.categories.length > 0) {
      const timeoutId = setTimeout(checkAndAddChacolabSchedule, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, schedules, settings.users, settings.categories, addSchedule]);

  // Get holidays for current year and adjacent years
  const holidays = useMemo(() => {
    const year = currentDate.getFullYear();
    return [
      ...getKoreanHolidays(year - 1),
      ...getKoreanHolidays(year),
      ...getKoreanHolidays(year + 1),
    ];
  }, [currentDate]);

  // Filter schedules based on selected users and categories (multi-select)
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;
    
    // Filter by selected users (if any selected, show schedules from any of them)
    if (selectedUserIds.length > 0) {
      filtered = filtered.filter(s => selectedUserIds.includes(s.userId));
    }
    
    // Filter by selected categories (if any selected, show schedules from any of them)
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter(s => selectedCategoryIds.includes(s.categoryId));
    }
    
    return filtered;
  }, [schedules, selectedUserIds, selectedCategoryIds]);

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
    files?: ScheduleFile[];
    address?: string;
  }) => {
    if (!selectedDate) return;

    // Add main schedule
    addSchedule({
      ...data,
      date: selectedDate,
    });

    // Check if category is "공구" - auto add settlement schedule 11 days later
    const category = settings.categories.find(c => c.id === data.categoryId);
    if (category && category.name === '공구') {
      const settlementDate = addDays(selectedDate, 11);
      // 정산 스케줄은 "이승진" 사용자로 자동 등록
      const userSeungjin = settings.users.find(u => u.name === '이승진');
      addSchedule({
        title: `정산+${data.title}`,
        description: `${data.title} 공구 정산 (원 스케줄 날짜: ${selectedDate})`,
        date: settlementDate,
        userId: userSeungjin?.id || data.userId,
        categoryId: data.categoryId,
      });
    }
  };

  const handleUpdateSchedule = (id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => {
    updateSchedule(id, updates);
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

  // Handler for user toggle - multi-select
  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handler for category toggle - multi-select
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
          selectedUserIds={selectedUserIds}
          selectedCategoryIds={selectedCategoryIds}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodaySchedule={handleTodaySchedule}
          onUserSelect={handleUserSelect}
          onCategorySelect={handleCategorySelect}
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
              onToggleComplete={toggleScheduleComplete}
              onUpdate={handleUpdateSchedule}
            />
          </div>
        )}

        {/* Lunar Converter */}
        <LunarConverter onAddToCalendar={handleAddFromLunar} />

        {/* Gongu Schedule List */}
        <GonguList 
          schedules={schedules} 
          categories={settings.categories} 
        />

        {/* Modals */}
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={handleAddSchedule}
          date={selectedDate ?? ''}
          users={settings.users}
          categories={settings.categories}
          selectedUserId={scheduleDefaultUserId || (selectedUserIds.length === 1 ? selectedUserIds[0] : null)}
          selectedCategoryId={scheduleDefaultCategoryId || (selectedCategoryIds.length === 1 ? selectedCategoryIds[0] : null)}
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
