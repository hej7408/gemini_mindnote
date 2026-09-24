import React from 'react';
import { Sparkles, HeartHandshake, Smile, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  studentName: string;
  totalEntries: number;
  onStartWriting: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  studentName,
  totalEntries,
  onStartWriting,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-100 border border-amber-200/60 p-6 md:p-8 shadow-xs">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{todayFormatted} · 오늘의 감정 날씨</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 balance">
            안녕하세요, <span className="text-amber-700">{studentName || '소중한 친구'}</span>님!<br />
            오늘 하루 마음속엔 어떤 바람이 불었나요?
          </h1>

          <p className="text-sm md:text-base text-stone-600 max-w-xl leading-relaxed">
            기쁜 일, 속상했던 일, 말 못 한 고민까지 다정이 AI 선생님에게 편하게 털어놓아 보세요. 
            언제나 너의 편이 되어 따뜻한 위로와 응원을 전해줄게요.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>지금까지 <strong>{totalEntries}편</strong>의 마음이 기록되었어요</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>구글 스프레드시트 실시간 동기화 지원</span>
            </div>
          </div>
        </div>

        {/* Mascot & Visual Spotlight */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md bg-white">
            <img
              src="/src/assets/images/mind_diary_mascot_1790274411249.jpg"
              alt="AI 마음 상담사 다정이"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-3 bg-white/95 px-3 py-1 rounded-full shadow-xs border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>AI 상담사 다정이</span>
          </div>
        </div>
      </div>
    </div>
  );
};
