import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const [userId, setUserId] = useState(users[0]?.id || 'none');
  const [categoryId, setCategoryId] = useState('none');

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
      setUserId(users[0]?.id || 'none');
      setCategoryId('none');
    }
  }, [isOpen, editingSchedule, users]);

  if (!isOpen) return null;

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
      userId: userId === 'none' ? '' : userId,
      categoryId: categoryId === 'none' ? '' : categoryId,
    });

    // Reset form
    setDay('1');
    setTitle('');
    setDescription('');
    setUserId(users[0]?.id || '');
    setCategoryId('');
    onClose();
  };

  const handleClose = () => {
    setDay('1');
    setTitle('');
    setDescription('');
    setUserId(users[0]?.id || '');
    setCategoryId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-1">
          {editingSchedule ? '매월 스케줄 수정' : '매월 스케줄 추가'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {editingSchedule 
            ? '매월 반복되는 모든 스케줄이 일괄 수정됩니다'
            : '현재 연도와 다음 연도 24개월에 자동 등록됩니다'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Input */}
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
              매월 반복될 날짜 (1~31일). 해당 날짜가 없는 달은 자동 생략됩니다.
            </p>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">스케줄 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="스케줄 제목을 입력하세요"
              required
            />
          </div>

          {/* User and Category Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>사용자</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {categories
                    .filter(cat => cat.name !== '생일')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">상세 내용</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 입력하세요 (선택사항)"
              rows={3}
            />
          </div>

          {/* Warning for editing */}
          {editingSchedule && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ 주의: 수정 시 매월 반복되는 모든 스케줄이 일괄 변경됩니다.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1">
              {editingSchedule ? '수정완료' : '입력완료'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
