import { useState } from 'react';
import { Trash2, Check, Pencil, X, Image, FileText, Calendar, Download, MapPin, Copy, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Schedule, User, Category, ScheduleFile } from '@/types/calendar';
import { solarToLunar } from '@/utils/lunarCalendar';
import { cn } from '@/lib/utils';
import { colorClasses, getColorClass } from '@/lib/colors';

interface ScheduleListProps {
  schedules: Schedule[];
  users: User[];
  categories: Category[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => void;
}

export function ScheduleList({ schedules, users, categories, onDelete, onToggleComplete, onUpdate }: ScheduleListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editFiles, setEditFiles] = useState<ScheduleFile[]>([]);
  const [editAddress, setEditAddress] = useState('');
  
  // Image/PDF viewer state
  const [viewingFile, setViewingFile] = useState<ScheduleFile | null>(null);
  
  // 주소 복사 상태
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  const getUserColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return colorClasses[0];
    return getColorClass(user.colorIndex);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return colorClasses[0];
    return getColorClass(category.colorIndex);
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
    setEditDate(schedule.date);
    setEditUserId(schedule.userId);
    setEditCategoryId(schedule.categoryId);
    setEditFiles(schedule.files || []);
    setEditAddress(schedule.address || '');
  };

  const handleEditSave = () => {
    if (!editingSchedule || !editTitle.trim()) return;
    
    onUpdate(editingSchedule.id, {
      title: editTitle,
      description: editDescription,
      date: editDate,
      userId: editUserId,
      categoryId: editCategoryId,
      files: editFiles,
      address: editAddress.trim() || undefined,
    });
    
    setEditingSchedule(null);
  };

  const handleEditCancel = () => {
    setEditingSchedule(null);
    setEditTitle('');
    setEditDescription('');
    setEditDate('');
    setEditUserId('');
    setEditCategoryId('');
    setEditFiles([]);
    setEditAddress('');
  };

  // 주소 복사 기능
  const handleCopyAddress = async (address: string, scheduleId: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddressId(scheduleId);
      setTimeout(() => setCopiedAddressId(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // T맵 내비 연동 기능
  const handleTmapNavi = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    // T맵 앱 스킴 (목적지 검색)
    const tmapAppUrl = `tmap://search?name=${encodedAddress}`;
    // 웹 폴백 URL (T맵 웹)
    const webFallbackUrl = `https://tmap.life/search?address=${encodedAddress}`;
    
    const startTime = Date.now();
    window.location.href = tmapAppUrl;
    
    setTimeout(() => {
      if (Date.now() - startTime < 1500) {
        window.open(webFallbackUrl, '_blank');
      }
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const fileType: 'image' | 'pdf' = file.type.includes('pdf') ? 'pdf' : 'image';
        setEditFiles(prev => [...prev, {
          name: file.name,
          url: result,
          type: fileType,
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index));
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
        const hasFiles = schedule.files && schedule.files.length > 0;
        
        return (
          <div
            key={schedule.id}
            className={cn(
              "bg-card border border-border rounded-lg p-3 transition-opacity",
              isCompleted && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={`w-1 min-h-[40px] rounded-full ${getUserColor(schedule.userId)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!isBirthday && schedule.categoryId && (
                    <span className={`px-1.5 py-0.5 rounded text-white text-xs ${getCategoryColor(schedule.categoryId)}`}>
                      {getCategoryName(schedule.categoryId)}
                    </span>
                  )}
                  <span className={cn(
                    "font-medium",
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
                
                {/* 주소 표시 */}
                {schedule.address && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {schedule.address}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(schedule.address!, schedule.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedAddressId === schedule.id ? '복사됨!' : '복사'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTmapNavi(schedule.address!)}
                      className="h-7 px-2 text-xs bg-[#1C64F2] hover:bg-[#1A56DB] text-white"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      T맵
                    </Button>
                  </div>
                )}
                
                {/* File attachments */}
                {hasFiles && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {schedule.files!.map((file, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingFile(file)}
                        className="h-7 text-xs"
                      >
                        {file.type === 'image' ? (
                          <Image className="h-3 w-3 mr-1" />
                        ) : (
                          <FileText className="h-3 w-3 mr-1" />
                        )}
                        {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Action buttons - moved to bottom */}
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(schedule)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleComplete(schedule.id)}
                    className={cn(
                      "hover:bg-green-50",
                      isCompleted ? "text-green-600 bg-green-50" : "text-muted-foreground"
                    )}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {isCompleted ? "완료됨" : "완료"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmId(schedule.id)}
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setViewingFile(null)} />
          <div className="relative bg-card rounded-xl shadow-xl max-w-4xl max-h-[90vh] mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-medium truncate flex-1 mr-2">{viewingFile.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                {/* 다운로드 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = viewingFile.url;
                    link.download = viewingFile.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingFile(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {viewingFile.type === 'image' ? (
                <img 
                  src={viewingFile.url} 
                  alt={viewingFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <iframe 
                  src={viewingFile.url}
                  title={viewingFile.name}
                  className="w-full h-[70vh]"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleEditCancel} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                <Label htmlFor="edit-date">날짜</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                          ? `${getColorClass(user.colorIndex)} text-white`
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
                          ? `${getColorClass(category.colorIndex)} text-white`
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주소 입력 섹션 */}
              <div className="space-y-2">
                <Label htmlFor="edit-address">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    주소 (T맵 연동)
                  </div>
                </Label>
                <Input
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="주소를 입력하세요 (선택사항)"
                />
              </div>

              {/* File upload section */}
              <div className="space-y-2">
                <Label>첨부 파일</Label>
                <div className="flex flex-wrap gap-2">
                  {editFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                      {file.type === 'image' ? (
                        <Image className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded text-sm transition-colors">
                      <Image className="h-4 w-4" />
                      이미지 추가
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded text-sm transition-colors">
                      <FileText className="h-4 w-4" />
                      PDF 추가
                    </div>
                  </label>
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
