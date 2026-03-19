import { useMemo, useState } from 'react';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Schedule, User, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { MonthlyScheduleModal } from './MonthlyScheduleModal';

interface MonthlyScheduleListProps {
  schedules: Schedule[];
  users: User[];
  categories: Category[];
  onAddMonthlySchedule: (schedule: {
    day: number;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  }) => void;
  onUpdateMonthlySchedule: (
    day: number,
    oldTitle: string,
    updates: {
      day?: number;
      title?: string;
      description?: string;
      userId?: string;
      categoryId?: string;
    }
  ) => void;
  onDeleteMonthlySchedule: (day: number, title: string) => void;
}

interface MonthlyScheduleGroup {
  day: number;
  title: string;
  description: string;
  userId: string;
  categoryId: string;
  count: number; // 총 몇 개의 스케줄이 있는지
}

export function MonthlyScheduleList({
  schedules,
  users,
  categories,
  onAddMonthlySchedule,
  onUpdateMonthlySchedule,
  onDeleteMonthlySchedule,
}: MonthlyScheduleListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MonthlyScheduleGroup | null>(null);

  // 매월 반복되는 스케줄 찾기 (같은 일(day)과 제목을 가진 스케줄들)
  const monthlySchedules = useMemo(() => {
    const scheduleMap = new Map<string, MonthlyScheduleGroup>();

    schedules.forEach(schedule => {
      const day = parseInt(schedule.date.split('-')[2]);
      const key = `${day}-${schedule.title}`;

      if (scheduleMap.has(key)) {
        const existing = scheduleMap.get(key)!;
        existing.count++;
      } else {
        scheduleMap.set(key, {
          day,
          title: schedule.title,
          description: schedule.description,
          userId: schedule.userId,
          categoryId: schedule.categoryId,
          count: 1,
        });
      }
    });

    // 최소 2개 이상의 스케줄이 있는 것만 반복 스케줄로 간주
    return Array.from(scheduleMap.values())
      .filter(group => group.count >= 2)
      .sort((a, b) => a.day - b.day);
  }, [schedules]);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || '알 수 없음';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '없음';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.colorIndex || 0;
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: MonthlyScheduleGroup) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (schedule: MonthlyScheduleGroup) => {
    if (confirm(`매월 ${schedule.day}일의 "${schedule.title}" 스케줄을 모두 삭제하시겠습니까? (총 ${schedule.count}개)`)) {
      onDeleteMonthlySchedule(schedule.day, schedule.title);
    }
  };

  const handleSubmit = (data: {
    day: number;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  }) => {
    if (editingSchedule) {
      // 수정
      onUpdateMonthlySchedule(editingSchedule.day, editingSchedule.title, data);
    } else {
      // 추가
      onAddMonthlySchedule(data);
    }
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              매월 스케줄 관리
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {monthlySchedules.length}개
              </span>
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              스케줄 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {monthlySchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              매월 반복되는 스케줄이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {monthlySchedules.map((schedule, index) => {
                const categoryColor = getCategoryColor(schedule.categoryId);
                
                return (
                  <div
                    key={`${schedule.day}-${schedule.title}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Day */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {schedule.day}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        매월
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{schedule.title}</h4>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full shrink-0">
                          {schedule.count}회
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {schedule.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          👤 {getUserName(schedule.userId)}
                        </span>
                        {schedule.categoryId && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full",
                                `bg-color-${categoryColor} text-color-${categoryColor}-foreground`
                              )}
                            >
                              {getCategoryName(schedule.categoryId)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MonthlyScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleSubmit}
        users={users}
        categories={categories}
        editingSchedule={editingSchedule}
      />
    </>
  );
}
