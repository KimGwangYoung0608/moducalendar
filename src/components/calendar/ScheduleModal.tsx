import { useState, useEffect } from 'react';
import { X, Image, FileText, MapPin, Copy, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Category, ScheduleFile } from '@/types/calendar';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; userId: string; categoryId: string; files?: ScheduleFile[]; address?: string }) => void;
  date: string;
  users: User[];
  categories: Category[];
  selectedUserId: string | null;
  selectedCategoryId: string | null;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  date,
  users,
  categories,
  selectedUserId,
  selectedCategoryId,
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(selectedUserId || (users[0]?.id ?? ''));
  const [categoryId, setCategoryId] = useState(selectedCategoryId || (categories[0]?.id ?? ''));
  const [files, setFiles] = useState<ScheduleFile[]>([]);
  const [address, setAddress] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);

  // Update userId when selectedUserId changes (from header click)
  useEffect(() => {
    if (selectedUserId) {
      setUserId(selectedUserId);
    }
  }, [selectedUserId]);

  // Update categoryId when selectedCategoryId changes (from header click)
  useEffect(() => {
    if (selectedCategoryId) {
      setCategoryId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;

    Array.from(inputFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const fileType: 'image' | 'pdf' = file.type.includes('pdf') ? 'pdf' : 'image';
        setFiles(prev => [...prev, {
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
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userId || !categoryId) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      userId,
      categoryId,
      files: files.length > 0 ? files : undefined,
      address: address.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setFiles([]);
    setAddress('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setFiles([]);
    setAddress('');
    onClose();
  };

  // 주소 복사 기능
  const handleCopyAddress = async () => {
    if (!address.trim()) return;
    try {
      await navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // T맵 내비 연동 기능
  const handleTmapNavi = () => {
    if (!address.trim()) return;
    const encodedAddress = encodeURIComponent(address);
    
    // T맵 앱 URL Scheme (목적지 검색)
    const tmapAppUrl = `tmap://search?name=${encodedAddress}`;
    
    // 웹 폴백 URL (네이버 지도 - T맵 웹이 불안정하여 대체)
    const webFallbackUrl = `https://map.naver.com/v5/search/${encodedAddress}`;
    
    // 모바일 여부 확인
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일: T맵 앱 실행 시도
      window.location.href = tmapAppUrl;
    } else {
      // PC: 바로 네이버 지도 웹으로 이동
      window.open(webFallbackUrl, '_blank');
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
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

        <h2 className="text-xl font-semibold mb-1">스케줄 추가</h2>
        <p className="text-sm text-muted-foreground mb-6">{formatDisplayDate(date)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>사용자</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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

          {/* 주소 입력 섹션 */}
          <div className="space-y-2">
            <Label htmlFor="address">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                주소 (T맵 연동)
              </div>
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="주소를 입력하세요 (선택사항)"
                className="flex-1"
              />
            </div>
            {address.trim() && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 text-xs"
                >
                  <Copy className="h-3 w-3" />
                  {addressCopied ? '복사됨!' : '주소 복사'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTmapNavi}
                  className="flex items-center gap-1 text-xs bg-[#1C64F2] hover:bg-[#1A56DB] text-white border-[#1C64F2]"
                >
                  <Navigation className="h-3 w-3" />
                  T맵
                </Button>
              </div>
            )}
          </div>

          {/* File upload section */}
          <div className="space-y-2">
            <Label>첨부 파일</Label>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((file, index) => (
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
            )}
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
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1">
              입력완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
