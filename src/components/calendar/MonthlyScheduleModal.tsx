import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Category } from '@/types/calendar';

interface MonthlyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    day: number;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  }) => void;
  users: User[];
  categories: Category[];
  editingSchedule?: {
    day: number;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
  } | null;
}

export function MonthlyScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  users,
  categories,
  editingSchedule,
}: MonthlyScheduleModalProps) {
  const [day, setDay] = useState<string>('1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Reset form when modal opens/closes or editing schedule changes
  useEffect(() => {
    if (isOpen && editingSchedule) {
      setDay(String(editingSchedule.day));
      setTitle(editingSchedule.title);
      setDescription(editingSchedule.description);
      setUserId(editingSchedule.userId);
      setCategoryId(editingSchedule.categoryId);
    } else if (isOpen && !editingSchedule) {
      setDay('1');
      setTitle('');
      setDescription('');
      setUserId(users[0]?.id || '');
      setCategoryId(categories[0]?.id || '');
    }
  }, [isOpen, editingSchedule, users, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      alert('1~31 사이의 날짜를 입력해주세요.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    onSubmit({
      day: dayNum,
      title: title.trim(),
      description: description.trim(),
      userId,
      categoryId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? '매월 스케줄 수정' : '매월 스케줄 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day */}
          <div className="space-y-2">
            <Label htmlFor="day">매월 날짜</Label>
            <div className="flex items-center gap-2">
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-24"
                required
              />
              <span className="text-sm text-muted-foreground">일</span>
            </div>
            <p className="text-xs text-muted-foreground">
              1~31 사이의 날짜를 입력하세요. 해당 날짜가 없는 달에는 자동으로 생략됩니다.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="스케줄 제목"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="스케줄 설명"
              rows={3}
            />
          </div>

          {/* User */}
          <div className="space-y-2">
            <Label htmlFor="user">담당자</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="담당자 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">없음</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">없음</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingSchedule && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ 수정 시 매월 반복되는 모든 스케줄이 일괄 변경됩니다.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {editingSchedule ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
