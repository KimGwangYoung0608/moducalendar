import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Schedule, User, Category } from '@/types/calendar';
import { solarToLunar } from '@/utils/lunarCalendar';

interface ScheduleListProps {
  schedules: Schedule[];
  users: User[];
  categories: Category[];
  onDelete: (id: string) => void;
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

export function ScheduleList({ schedules, users, categories, onDelete }: ScheduleListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const getUserColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return colorClasses[0];
    return colorClasses[(user.colorIndex - 1) % 8];
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return colorClasses[0];
    return colorClasses[(category.colorIndex - 1) % 8];
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name ?? '알 수 없음';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name ?? '알 수 없음';
  };

  const formatDateWithLunar = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const lunar = solarToLunar(year, month, day);
    if (lunar) {
      return `${year}년 ${month}월 ${day}일 (음력 ${lunar.lunarYear}년 ${lunar.lunarMonth}월 ${lunar.lunarDay}일)`;
    }
    return `${year}년 ${month}월 ${day}일`;
  };

  if (schedules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        선택한 날짜에 스케줄이 없습니다
      </p>
    );
  }

  // Check if schedule is a birthday
  const isBirthdaySchedule = (schedule: Schedule) => {
    return schedule.title.includes('생일') || schedule.title.startsWith('🎂');
  };

  return (
    <div className="space-y-2">
      {schedules.map((schedule) => {
        const isBirthday = isBirthdaySchedule(schedule);
        return (
          <div
            key={schedule.id}
            className="bg-card border border-border rounded-lg p-3 flex items-start gap-3"
          >
            <div className={`w-1 h-full min-h-[40px] rounded-full ${getUserColor(schedule.userId)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!isBirthday && (
                  <span className={`px-1.5 py-0.5 rounded text-white text-xs ${getUserColor(schedule.userId)}`}>
                    {getCategoryName(schedule.categoryId)}
                  </span>
                )}
                <span className="font-medium truncate">{schedule.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`px-1.5 py-0.5 rounded text-white text-xs ${getUserColor(schedule.userId)}`}>
                  {getUserName(schedule.userId)}
                </span>
                <span className="text-muted-foreground">
                  {formatDateWithLunar(schedule.date)}
                </span>
              </div>
              {schedule.description && (
                <p className="text-sm text-muted-foreground mt-2">{schedule.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmId(schedule.id)}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">스케줄 삭제</h3>
            <p className="text-muted-foreground mb-6">정말로 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
