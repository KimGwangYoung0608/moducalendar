import { ChevronLeft, ChevronRight, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Category } from '@/types/calendar';
import { getColorClass } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  users: User[];
  categories: Category[];
  selectedUserIds: string[];
  selectedCategoryIds: string[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodaySchedule: () => void;
  onUserSelect: (userId: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onOpenSettings: () => void;
  onUserClickForSchedule: (userId: string) => void;
  onCategoryClickForSchedule: (categoryId: string) => void;
}

export function CalendarHeader({
  currentDate,
  users,
  categories,
  selectedUserIds,
  selectedCategoryIds,
  onPrevMonth,
  onNextMonth,
  onTodaySchedule,
  onUserSelect,
  onCategorySelect,
  onOpenSettings,
  onUserClickForSchedule,
  onCategoryClickForSchedule,
}: CalendarHeaderProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onTodaySchedule} className="gap-1">
            <Calendar className="h-4 w-4" />
            오늘의스케줄
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground">
          {year}년 {month}월
        </h2>

        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* User & Category Filter */}
      <div className="flex flex-wrap gap-4">
        {/* Users - multi-select with color toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">사용자:</span>
          {users.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            return (
              <Button
                key={user.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  onUserSelect(user.id);
                  onUserClickForSchedule(user.id);
                }}
                className={cn(
                  "h-7 text-xs gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95",
                  isSelected && `${getColorClass(user.colorIndex)} text-white border-transparent`
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isSelected ? "bg-white/80" : getColorClass(user.colorIndex)
                  )}
                />
                {user.name}
              </Button>
            );
          })}
        </div>

        {/* Categories - multi-select with color toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">카테고리:</span>
          {categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            return (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  onCategorySelect(category.id);
                  onCategoryClickForSchedule(category.id);
                }}
                className={cn(
                  "h-7 text-xs gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95",
                  isSelected && `${getColorClass(category.colorIndex)} text-white border-transparent`
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isSelected ? "bg-white/80" : getColorClass(category.colorIndex)
                  )}
                />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
