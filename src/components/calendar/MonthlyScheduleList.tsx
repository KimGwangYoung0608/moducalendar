import { useMemo, useState } from 'react';
import { Calendar, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  count: number;
  schedules: Array<{
    day: number;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  }>;
}

interface GroupedSchedule {
  title: string;
  items: MonthlyScheduleGroup[];
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
  const [expandedTitles, setExpandedTitles] = useState<Set<string>>(new Set());

  // 매월 반복되는 스케줄 찾기 및 생일 제외
  const monthlySchedules = useMemo(() => {
    const scheduleMap = new Map<string, MonthlyScheduleGroup>();

    schedules.forEach(schedule => {
      // 생일 카테고리 제외
      const category = categories.find(c => c.id === schedule.categoryId);
      if (category && category.name === '생일') {
        return;
      }

      const day = parseInt(schedule.date.split('-')[2]);
      const key = `${day}-${schedule.title}`;

      if (scheduleMap.has(key)) {
        const existing = scheduleMap.get(key)!;
        existing.count++;
        existing.schedules.push({
          day,
          title: schedule.title,
          description: schedule.description,
          userId: schedule.userId,
          categoryId: schedule.categoryId,
        });
      } else {
        scheduleMap.set(key, {
          day,
          title: schedule.title,
          description: schedule.description,
          userId: schedule.userId,
          categoryId: schedule.categoryId,
          count: 1,
          schedules: [{
            day,
            title: schedule.title,
            description: schedule.description,
            userId: schedule.userId,
            categoryId: schedule.categoryId,
          }],
        });
      }
    });

    // 최소 2개 이상의 스케줄이 있는 것만 반복 스케줄로 간주
    return Array.from(scheduleMap.values())
      .filter(group => group.count >= 2)
      .sort((a, b) => a.day - b.day);
  }, [schedules, categories]);

  // 같은 제목끼리 그룹화
  const groupedSchedules = useMemo(() => {
    const grouped = new Map<string, MonthlyScheduleGroup[]>();

    monthlySchedules.forEach(schedule => {
      if (!grouped.has(schedule.title)) {
        grouped.set(schedule.title, []);
      }
      grouped.get(schedule.title)!.push(schedule);
    });

    return Array.from(grouped.entries()).map(([title, items]) => ({
      title,
      items: items.sort((a, b) => a.day - b.day),
    }));
  }, [monthlySchedules]);

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

  const toggleExpanded = (title: string) => {
    setExpandedTitles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, schedule: MonthlyScheduleGroup) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, schedule: MonthlyScheduleGroup) => {
    e.preventDefault();
    e.stopPropagation();
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
                {groupedSchedules.length}개 제목 / {monthlySchedules.length}개 일정
              </span>
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              스케줄 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groupedSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              매월 반복되는 스케줄이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {groupedSchedules.map((group) => {
                const isExpanded = expandedTitles.has(group.title);
                const totalCount = group.items.reduce((sum, item) => sum + item.count, 0);
                
                return (
                  <div
                    key={group.title}
                    className="rounded-lg border bg-card overflow-hidden"
                  >
                    {/* 제목 헤더 */}
                    <button
                      onClick={() => toggleExpanded(group.title)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{group.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.items.length}개 날짜 · 총 {totalCount}회 반복
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* 확장된 내용 */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20">
                        {group.items.map((schedule, index) => {
                          const categoryColor = getCategoryColor(schedule.categoryId);
                          
                          return (
                            <div
                              key={`${schedule.day}-${schedule.title}-${index}`}
                              className="p-4 border-b last:border-b-0 bg-card hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-start gap-3">
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
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full shrink-0">
                                      {schedule.count}회
                                    </span>
                                  </div>
                                  {schedule.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {schedule.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs mb-3">
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

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => handleEdit(e, schedule)}
                                      className="h-8"
                                    >
                                      <Pencil className="h-3 w-3 mr-1" />
                                      수정
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => handleDelete(e, schedule)}
                                      className="h-8 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      삭제
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
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
      )}
    </>
  );
}
