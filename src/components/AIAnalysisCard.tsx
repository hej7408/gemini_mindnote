import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Heart, Award, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { AIAnalysisResult } from '../types/diary';
import confetti from 'canvas-confetti';

interface AIAnalysisCardProps {
  analysis: AIAnalysisResult;
  studentName: string;
  emotionLabel: string;
  onSaveToTimeline: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  studentName,
  emotionLabel,
  onSaveToTimeline,
  isSaving,
  isSaved,
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#8B5CF6']
      });
    } catch {
      // Confetti optional
    }
  }, []);

  // Text-To-Speech functionality
  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 읽기(TTS) 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${studentName} 친구에게 전하는 다정이 선생님의 마음 편지입니다. ${analysis.empathyMessage} 오늘의 처방전: ${analysis.advice} 오늘의 칭찬: ${analysis.compliment}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md p-6 sm:p-8 space-y-6 transition-all animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
            <img
              src="/src/assets/images/mind_diary_mascot_1790274411249.jpg"
              alt="다정이"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>다정이 선생님의 마음 답장</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-stone-500">
              {studentName} 님의 {emotionLabel} 마음에 귀 기울여 적은 따뜻한 글이에요
            </p>
          </div>
        </div>

        {/* TTS Button */}
        <button
          onClick={handleToggleTTS}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            isPlayingTTS
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
          }`}
        >
          {isPlayingTTS ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>음성 중지</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-stone-600" />
              <span>다정이 목소리로 듣기 (TTS)</span>
            </>
          )}
        </button>
      </div>

      {/* Counselor Empathy Letter */}
      <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/60 relative">
        <div className="text-amber-900/40 absolute -top-3 left-4 text-3xl font-serif">“</div>
        <p className="text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium pl-3">
          {analysis.empathyMessage}
        </p>
      </div>

      {/* Mind Prescription & Compliment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mind Prescription */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-emerald-800 mb-1">
              오늘의 마음 처방전 (작은 실천)
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 leading-snug">
              {analysis.advice}
            </p>
          </div>
        </div>

        {/* Compliment */}
        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-purple-800 mb-1">
              오늘 발견한 너의 멋진 점
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 leading-snug">
              {analysis.compliment}
            </p>
          </div>
        </div>
      </div>

      {/* Keywords and Emotion Metrics */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span className="font-semibold text-stone-700">감정 키워드:</span>
          {analysis.keywords.map((kw, i) => (
            <span key={i} className="text-stone-700 font-medium">
              #{kw}{i < analysis.keywords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>

        {/* Emotion Metrics */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">긍정 지수</span>
            <span className="font-semibold text-emerald-600">{analysis.positiveScore}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">마음 부담</span>
            <span className="font-semibold text-amber-600">{analysis.stressScore}%</span>
          </div>
        </div>
      </div>

      {/* Teacher Attention Alert (if applicable) */}
      {analysis.needsTeacherAttention && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-800">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            오늘 마음이 많이 힘들었군요. 혼자 고민하지 말고 선생님이나 부모님께 한 번 더 이야기해보면 큰 힘이 될 거예요.
          </span>
        </div>
      )}

      {/* Quote Banner */}
      <div className="text-center py-2 px-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-lg text-xs sm:text-sm italic text-stone-700 font-serif border border-amber-100">
        “{analysis.quote}”
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          onClick={onSaveToTimeline}
          disabled={isSaving || isSaved}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-xs cursor-default'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow'
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>일기 및 백엔드 저장 중...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>저장 완료 (기록장에서 확인 가능)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>일기 저장 및 완료하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
