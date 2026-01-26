import { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  solarToLunar,
  lunarToSolar,
  getZodiacFull,
  calculateAge,
  formatSolarDate,
  formatLunarDate,
} from '@/utils/lunarCalendar';

interface LunarConverterProps {
  onAddToCalendar: (date: string, title: string, isLunar: boolean, lunarMonth: number, lunarDay: number, yearsToAdd?: number[]) => void;
}

export function LunarConverter({ onAddToCalendar }: LunarConverterProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [result, setResult] = useState<{
    solarDate: string;
    lunarDate: string;
    zodiac: string;
    age: number;
    solarDateStr: string;
    lunarMonth: number;
    lunarDay: number;
  } | null>(null);

  // Modal state for name input
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ isLunar: boolean } | null>(null);
  const [nameInput, setNameInput] = useState('');

  const handleConvert = () => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return;
    }

    const lunarResult = solarToLunar(y, m, d);
    if (!lunarResult) {
      return;
    }

    const zodiac = getZodiacFull(y);
    const age = calculateAge(y, m, d);

    setResult({
      solarDate: formatSolarDate(y, m, d),
      lunarDate: formatLunarDate(lunarResult.lunarYear, lunarResult.lunarMonth, lunarResult.lunarDay),
      zodiac,
      age,
      solarDateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      lunarMonth: lunarResult.lunarMonth,
      lunarDay: lunarResult.lunarDay,
    });
  };

  const handleOpenNameModal = (isLunar: boolean) => {
    setPendingAdd({ isLunar });
    setNameInput('');
    setShowNameModal(true);
  };

  const handleConfirmAdd = () => {
    if (!result || !pendingAdd || !nameInput.trim()) return;

    // Generate years from current year to 10 years in the future
    const currentYear = new Date().getFullYear();
    const yearsToAdd = Array.from({ length: 11 }, (_, i) => currentYear + i);

    if (pendingAdd.isLunar) {
      // For lunar birthdays, we need to convert lunar to solar for each year
      const lunarBirthdayDates: string[] = [];
      
      yearsToAdd.forEach(targetYear => {
        const solarDate = lunarToSolar(targetYear, result.lunarMonth, result.lunarDay);
        if (solarDate) {
          const dateStr = `${solarDate.year}-${String(solarDate.month).padStart(2, '0')}-${String(solarDate.day).padStart(2, '0')}`;
          lunarBirthdayDates.push(dateStr);
        }
      });

      // Add for each year with converted solar dates
      lunarBirthdayDates.forEach(dateStr => {
        onAddToCalendar(dateStr, `${nameInput.trim()} 생일 (음력 ${result.lunarMonth}/${result.lunarDay})`, true, result.lunarMonth, result.lunarDay);
      });
    } else {
      // Solar date - add for multiple years
      const m = parseInt(month);
      const d = parseInt(day);
      const baseDate = `${currentYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      onAddToCalendar(baseDate, `${nameInput.trim()} 생일 (양력 ${m}/${d})`, false, 0, 0, yearsToAdd);
    }

    setShowNameModal(false);
    setPendingAdd(null);
    setNameInput('');
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">음력 변환기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="conv-year" className="text-xs">년</Label>
              <Input
                id="conv-year"
                type="number"
                placeholder="1990"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="conv-month" className="text-xs">월</Label>
              <Input
                id="conv-month"
                type="number"
                placeholder="1"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="conv-day" className="text-xs">일</Label>
              <Input
                id="conv-day"
                type="number"
                placeholder="1"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
            <Button onClick={handleConvert}>변환</Button>
          </div>

          {result && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">양력</div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.solarDate}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenNameModal(false)}
                      className="h-7 text-xs"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                      추가
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">음력</div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.lunarDate}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenNameModal(true)}
                      className="h-7 text-xs"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                      추가
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">띠</div>
                  <span className="font-medium">{result.zodiac}띠</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">만 나이</div>
                  <span className="font-medium">{result.age}세</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Name Input Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNameModal(false)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <button
              onClick={() => setShowNameModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">생일 등록</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {pendingAdd?.isLunar ? '음력' : '양력'} 생일로 등록됩니다
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="birthday-name">이름</Label>
                <Input
                  id="birthday-name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNameModal(false)} className="flex-1">
                  취소
                </Button>
                <Button onClick={handleConfirmAdd} className="flex-1" disabled={!nameInput.trim()}>
                  등록
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
