import { ChevronLeft, ChevronRight, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Category } from '@/types/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  users: User[];
  categories: Category[];
  selectedUserId: string | null;
  selectedCategoryId: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodaySchedule: () => void;
  onUserSelect: (userId: string | null) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onOpenSettings: () => void;
  onUserClickForSchedule: (userId: string) => void;
  onCategoryClickForSchedule: (categoryId: string) => void;
}

const colorClasses = [
  'bg-[hsl(220,90%,56%)]',
  'bg-[hsl(160,84%,39%)]',
  'bg-[hsl(340,82%,52%)]',
  'bg-[hsl(38,92%,50%)]',
  'bg-[hsl(262,83%,58%)]',
  'bg-[hsl(180,70%,45%)]',
  'bg-[hsl(10,78%,54%)]',
  'bg-[hsl(280,68%,50%)]',
];

export function CalendarHeader({
  currentDate,
  users,
  categories,
  selectedUserId,
  selectedCategoryId,
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
        {/* Users - removed 전체 button */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">사용자:</span>
          {users.map((user) => (
            <Button
              key={user.id}
              variant={selectedUserId === user.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onUserSelect(selectedUserId === user.id ? null : user.id);
                onUserClickForSchedule(user.id);
              }}
              className="h-7 text-xs gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${colorClasses[(user.colorIndex - 1) % 8]}`}
              />
              {user.name}
            </Button>
          ))}
        </div>

        {/* Categories - removed 전체 button */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">카테고리:</span>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onCategorySelect(selectedCategoryId === category.id ? null : category.id);
                onCategoryClickForSchedule(category.id);
              }}
              className="h-7 text-xs gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${colorClasses[(category.colorIndex - 1) % 8]}`}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
