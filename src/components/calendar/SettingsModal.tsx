import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarSettings, User, Category } from '@/types/calendar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalendarSettings;
  onSave: (settings: CalendarSettings) => void;
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

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [users, setUsers] = useState<User[]>(settings.users);
  const [categories, setCategories] = useState<Category[]>(settings.categories);

  // 설정이 변경될 때 로컬 상태 업데이트 (Firebase에서 로드된 데이터 반영)
  useEffect(() => {
    setUsers(settings.users);
    setCategories(settings.categories);
  }, [settings]);

  if (!isOpen) return null;

  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: `사용자${users.length + 1}`,
      colorIndex: (users.length % 8) + 1,
    };
    setUsers([...users, newUser]);
  };

  const handleRemoveUser = (id: string) => {
    if (users.length <= 1) return;
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUserNameChange = (id: string, name: string) => {
    setUsers(users.map(u => (u.id === id ? { ...u, name } : u)));
  };

  const handleUserColorChange = (id: string, colorIndex: number) => {
    setUsers(users.map(u => (u.id === id ? { ...u, colorIndex } : u)));
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: `카테고리${categories.length + 1}`,
      colorIndex: (categories.length % 8) + 1,
    };
    setCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleCategoryNameChange = (id: string, name: string) => {
    setCategories(categories.map(c => (c.id === id ? { ...c, name } : c)));
  };

  const handleCategoryColorChange = (id: string, colorIndex: number) => {
    setCategories(categories.map(c => (c.id === id ? { ...c, colorIndex } : c)));
  };

  const handleSave = () => {
    onSave({ users, categories });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">설정</h2>

        {/* Users Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">사용자 관리</Label>
            <Button variant="outline" size="sm" onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((colorIndex) => (
                      <button
                        key={colorIndex}
                        onClick={() => handleUserColorChange(user.id, colorIndex)}
                        className={`w-6 h-6 rounded-full ${colorClasses[colorIndex - 1]} ${
                          user.colorIndex === colorIndex ? 'ring-2 ring-offset-2 ring-foreground' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={users.length <= 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={user.name}
                  onChange={(e) => handleUserNameChange(user.id, e.target.value)}
                  placeholder="사용자 이름"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">카테고리 관리</Label>
            <Button variant="outline" size="sm" onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((colorIndex) => (
                      <button
                        key={colorIndex}
                        onClick={() => handleCategoryColorChange(category.id, colorIndex)}
                        className={`w-6 h-6 rounded-full ${colorClasses[colorIndex - 1]} ${
                          category.colorIndex === colorIndex ? 'ring-2 ring-offset-2 ring-foreground' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCategory(category.id)}
                    disabled={categories.length <= 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={category.name}
                  onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                  placeholder="카테고리 이름"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSave} className="flex-1">
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
