// 20개의 다양한 색상 팔레트
export const colorClasses = [
  'bg-[hsl(220,90%,56%)]',   // 1. 파란색
  'bg-[hsl(160,84%,39%)]',   // 2. 초록색
  'bg-[hsl(340,82%,52%)]',   // 3. 분홍색
  'bg-[hsl(38,92%,50%)]',    // 4. 주황색
  'bg-[hsl(262,83%,58%)]',   // 5. 보라색
  'bg-[hsl(180,70%,45%)]',   // 6. 청록색
  'bg-[hsl(10,78%,54%)]',    // 7. 빨간색
  'bg-[hsl(280,68%,50%)]',   // 8. 자주색
  'bg-[hsl(45,93%,47%)]',    // 9. 노란색
  'bg-[hsl(200,80%,50%)]',   // 10. 하늘색
  'bg-[hsl(330,70%,50%)]',   // 11. 마젠타
  'bg-[hsl(140,70%,40%)]',   // 12. 에메랄드
  'bg-[hsl(25,85%,55%)]',    // 13. 코랄
  'bg-[hsl(290,60%,55%)]',   // 14. 연보라
  'bg-[hsl(170,65%,45%)]',   // 15. 민트
  'bg-[hsl(355,75%,60%)]',   // 16. 연분홍
  'bg-[hsl(210,75%,45%)]',   // 17. 남색
  'bg-[hsl(85,60%,45%)]',    // 18. 연두색
  'bg-[hsl(15,90%,50%)]',    // 19. 진주황
  'bg-[hsl(240,60%,55%)]',   // 20. 인디고
];

// 색상 인덱스로 색상 클래스 가져오기 (1-based index)
export const getColorClass = (colorIndex: number): string => {
  return colorClasses[(colorIndex - 1) % colorClasses.length] || colorClasses[0];
};

// 총 색상 개수
export const COLOR_COUNT = colorClasses.length;
