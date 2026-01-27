import { useState } from 'react';
import { Trash2, Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Schedule, User, Category } from '@/types/calendar';
import { solarToLunar } from '@/utils/lunarCalendar';
import { cn } from '@/lib/utils';

interface ScheduleListProps {
  schedules: Schedule[];
  users: User[];
  categories: Category[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => void;
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

export function ScheduleList({ schedules, users, categories, onDelete, onToggleComplete, onUpdate }: ScheduleListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

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
      const leapPrefix = lunar.isLeapMonth ? '윤' : '';
      return `${year}년 ${month}월 ${day}일 (음력 ${lunar.lunarYear}년 ${leapPrefix}${lunar.lunarMonth}월 ${lunar.lunarDay}일)`;
    }
    return `${year}년 ${month}월 ${day}일 (음력 조회 필요)`;
  };

  const handleEditClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDescription(schedule.description);
    setEditUserId(schedule.userId);
    setEditCategoryId(schedule.categoryId);
  };

  const handleEditSave = () => {
    if (!editingSchedule || !editTitle.trim()) return;
    
    onUpdate(editingSchedule.id, {
      title: editTitle,
      description: editDescription,
      userId: editUserId,
      categoryId: editCategoryId,
    });
    
    setEditingSchedule(null);
  };

  const handleEditCancel = () => {
    setEditingSchedule(null);
    setEditTitle('');
    setEditDescription('');
    setEditUserId('');
    setEditCategoryId('');
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
        const isCompleted = schedule.isCompleted ?? false;
        return (
          <div
            key={schedule.id}
            className={cn(
              "bg-card border border-border rounded-lg p-3 flex items-start gap-3 transition-opacity",
              isCompleted && "opacity-60"
            )}
          >
            <div className={`w-1 h-full min-h-[40px] rounded-full ${getUserColor(schedule.userId)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!isBirthday && (
                  <span className={`px-1.5 py-0.5 rounded text-white text-xs ${getUserColor(schedule.userId)}`}>
                    {getCategoryName(schedule.categoryId)}
                  </span>
                )}
                <span className={cn(
                  "font-medium truncate",
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {schedule.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`px-1.5 py-0.5 rounded text-white text-xs ${getUserColor(schedule.userId)}`}>
                  {getUserName(schedule.userId)}
                </span>
                <span className={cn(
                  "text-muted-foreground",
                  isCompleted && "line-through"
                )}>
                  {formatDateWithLunar(schedule.date)}
                </span>
              </div>
              {schedule.description && (
                <p className={cn(
                  "text-sm text-muted-foreground mt-2",
                  isCompleted && "line-through"
                )}>
                  {schedule.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(schedule)}
                className="text-muted-foreground hover:text-blue-600"
                title="수정"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleComplete(schedule.id)}
                className={cn(
                  "text-muted-foreground hover:text-green-600",
                  isCompleted && "text-green-600 bg-green-100 hover:bg-green-200"
                )}
                title={isCompleted ? "완료 취소" : "완료"}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirmId(schedule.id)}
                className="text-muted-foreground hover:text-destructive"
                title="삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleEditCancel} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEditCancel}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">스케줄 수정</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="스케줄 제목"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="스케줄 설명 (선택)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>작성자</Label>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setEditUserId(user.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-colors",
                        editUserId === user.id
                          ? `${colorClasses[(user.colorIndex - 1) % 8]} text-white`
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>카테고리</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setEditCategoryId(category.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-colors",
                        editCategoryId === category.id
                          ? `${colorClasses[(category.colorIndex - 1) % 8]} text-white`
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleEditCancel} className="flex-1">
                  취소
                </Button>
                <Button onClick={handleEditSave} className="flex-1" disabled={!editTitle.trim()}>
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
