import { useMemo, useRef, useEffect, useState } from 'react';
import { ShoppingBag, ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Schedule, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface GonguListProps {
  schedules: Schedule[];
  categories: Category[];
}

export function GonguList({ schedules, categories }: GonguListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const itemHeight = 60; // Height of each item in pixels

  // Find "공구" category
  const gonguCategory = useMemo(() => {
    return categories.find(c => c.name === '공구');
  }, [categories]);

  // Filter schedules: only "공구" category, exclude "정산+" prefix schedules
  const gonguSchedules = useMemo(() => {
    if (!gonguCategory) return [];
    
    let filtered = schedules
      .filter(s => 
        s.categoryId === gonguCategory.id && 
        !s.title.startsWith('정산+')
      );
    
    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, gonguCategory, searchQuery]);

  // Find the index of the schedule closest to today (but not past)
  const todayIndex = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Find first schedule that is today or in the future
    const futureIndex = gonguSchedules.findIndex(s => s.date >= today);
    
    if (futureIndex === -1) {
      // All schedules are in the past, show the last one
      return Math.max(0, gonguSchedules.length - 1);
    }
    
    return futureIndex;
  }, [gonguSchedules]);

  // Initialize center index to today's closest schedule
  useEffect(() => {
    setCenterIndex(todayIndex);
  }, [todayIndex]);

  // Reset center index when search results change
  useEffect(() => {
    if (searchQuery.trim()) {
      setCenterIndex(0); // Reset to first result when searching
    } else {
      setCenterIndex(todayIndex); // Reset to today when clearing search
    }
  }, [searchQuery, todayIndex]);

  // Scroll to center the selected item
  useEffect(() => {
    if (containerRef.current && gonguSchedules.length > 0) {
      const scrollTop = centerIndex * itemHeight;
      containerRef.current.scrollTop = scrollTop;
    }
  }, [centerIndex, gonguSchedules.length]);

  // Handle scroll events
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const newCenterIndex = Math.round(scrollTop / itemHeight);
      if (newCenterIndex !== centerIndex && newCenterIndex >= 0 && newCenterIndex < gonguSchedules.length) {
        setCenterIndex(newCenterIndex);
      }
    }
  };

  // Check if a date is past
  const isPastDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  // Check if a date is today
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };

  // Navigate up/down
  const handleNavigate = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' 
      ? Math.max(0, centerIndex - 1)
      : Math.min(gonguSchedules.length - 1, centerIndex + 1);
    setCenterIndex(newIndex);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (!gonguCategory) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            공구 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            '공구' 카테고리를 설정에서 추가해주세요
          </p>
        </CardContent>
      </Card>
    );
  }

  if (gonguSchedules.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            공구 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="제목 또는 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center py-4">
            {searchQuery ? '검색 결과가 없습니다' : '등록된 공구 일정이 없습니다'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate visible items (5 items: 2 above, center, 2 below)
  const getVisibleItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = centerIndex + i;
      if (index >= 0 && index < gonguSchedules.length) {
        items.push({ schedule: gonguSchedules[index], position: i, index });
      } else {
        items.push({ schedule: null, position: i, index });
      }
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          공구 일정
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {gonguSchedules.length}개
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Search Input */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="제목 또는 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              '{searchQuery}' 검색 결과: {gonguSchedules.length}개
            </p>
          )}
        </div>

        {/* Navigation Up Button */}
        <button
          onClick={() => handleNavigate('up')}
          disabled={centerIndex === 0}
          className={cn(
            "w-full py-2 flex justify-center border-b transition-colors",
            centerIndex === 0 
              ? "text-muted-foreground/30 cursor-not-allowed" 
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        {/* Roulette Scroll Container */}
        <div className="relative overflow-hidden" style={{ height: `${itemHeight * 5}px` }}>
          {/* Center highlight bar */}
          <div 
            className="absolute left-0 right-0 bg-primary/10 border-y-2 border-primary/30 pointer-events-none z-10"
            style={{ 
              top: `${itemHeight * 2}px`, 
              height: `${itemHeight}px` 
            }}
          />
          
          {/* Items */}
          <div className="relative">
            {visibleItems.map(({ schedule, position, index }) => {
              if (!schedule) {
                return (
                  <div 
                    key={`empty-${position}`}
                    className="flex items-center justify-center"
                    style={{ height: `${itemHeight}px` }}
                  />
                );
              }

              const isPast = isPastDate(schedule.date);
              const isTodayDate = isToday(schedule.date);
              const isCenter = position === 0;

              return (
                <div
                  key={schedule.id}
                  className={cn(
                    "flex items-center px-4 transition-all duration-200",
                    isCenter && "scale-100",
                    position === -1 || position === 1 ? "scale-95 opacity-70" : "",
                    position === -2 || position === 2 ? "scale-90 opacity-40" : "",
                    isPast && "text-muted-foreground"
                  )}
                  style={{ height: `${itemHeight}px` }}
                >
                  {/* Date */}
                  <div className={cn(
                    "w-20 shrink-0 text-sm font-medium",
                    isTodayDate && "text-primary font-bold",
                    isPast && !isTodayDate && "line-through"
                  )}>
                    {formatDate(schedule.date)}
                  </div>

                  {/* Title */}
                  <div className={cn(
                    "flex-1 truncate px-2",
                    isCenter ? "text-base font-semibold" : "text-sm",
                    isPast && "line-through opacity-60"
                  )}>
                    {schedule.title}
                  </div>

                  {/* Status indicator */}
                  <div className="shrink-0">
                    {isTodayDate && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        오늘
                      </span>
                    )}
                    {isPast && !isTodayDate && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        지남
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Down Button */}
        <button
          onClick={() => handleNavigate('down')}
          disabled={centerIndex >= gonguSchedules.length - 1}
          className={cn(
            "w-full py-2 flex justify-center border-t transition-colors",
            centerIndex >= gonguSchedules.length - 1
              ? "text-muted-foreground/30 cursor-not-allowed" 
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {/* Position indicator */}
        <div className="text-center text-xs text-muted-foreground py-2 border-t">
          {centerIndex + 1} / {gonguSchedules.length}
        </div>
      </CardContent>
    </Card>
  );
}
