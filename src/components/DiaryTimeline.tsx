import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  Volume2,
  CloudCheck,
  CloudOff,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Award
} from 'lucide-react';
import { DiaryEntry, EmotionKey } from '../types/diary';
import { EMOTIONS, WEATHER_OPTIONS } from '../data/emotions';

interface DiaryTimelineProps {
  diaries: DiaryEntry[];
  onOpenWriter: () => void;
}

export const DiaryTimeline: React.FC<DiaryTimelineProps> = ({
  diaries,
  onOpenWriter,
}) => {
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(diaries[0]?.id || null);

  // Play TTS for recorded diary
  const handlePlayAudio = (entry: DiaryEntry) => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${entry.studentName} 친구에게 전하는 다정이의 답장입니다. ${entry.aiFeedback?.empathyMessage || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const filteredDiaries = diaries.filter((d) => {
    const matchesEmotion = selectedEmotionFilter === 'all' || d.emotionKey === selectedEmotionFilter;
    const matchesSearch =
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmotion && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>내 마음 기록장</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              차곡차곡 쌓인 내 감정의 발자국들과 AI 다정이의 답장을 다시 읽어보세요.
            </p>
          </div>

          <button
            onClick={onOpenWriter}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            + 새 일기 쓰기
          </button>
        </div>

        {/* Search & Emotion Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="제목, 내용, 이름으로 일기 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Emotion Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedEmotionFilter}
              onChange={(e) => setSelectedEmotionFilter(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-700"
            >
              <option value="all">모든 감정 보기</option>
              {EMOTIONS.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.emoji} {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Diary Entries List */}
      {filteredDiaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
            📝
          </div>
          <h3 className="text-base font-semibold text-stone-800">
            조건에 맞는 마음일기가 없습니다.
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            새로운 마음일기를 작성하거나 검색 필터를 초기화해보세요.
          </p>
          <button
            onClick={() => {
              setSelectedEmotionFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-1.5 rounded-lg text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiaries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const emoMeta = EMOTIONS.find((e) => e.key === entry.emotionKey) || EMOTIONS[0];
            const weatherIcon = WEATHER_OPTIONS.find((w) => w.type === entry.weather)?.icon || '☀️';

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-200 transition-all overflow-hidden"
              >
                {/* Entry Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 ${emoMeta.bgColor}`}
                    >
                      {emoMeta.emoji}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-stone-900">
                          {entry.title || `${entry.date}의 마음일기`}
                        </h3>
                        {entry.isPrivate && (
                          <span className="text-[11px] text-rose-700 flex items-center gap-0.5 font-medium">
                            <Lock className="w-3 h-3" />
                            <span>비밀일기</span>
                          </span>
                        )}
                      </div>

                      {/* Clean unboxed metadata discipline per frontend-design skill */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                        <span>{entry.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{weatherIcon}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-stone-700">{entry.studentName} ({entry.gradeClass || '5학년'})</span>
                        <span aria-hidden="true">·</span>
                        <span className={emoMeta.textColor}>강도 {entry.emotionIntensity}단계</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {entry.syncedToGAS ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium" title="Google Apps Script 동기화 완료">
                        <CloudCheck className="w-4 h-4" />
                        <span className="hidden md:inline">GAS 동기화됨</span>
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 flex items-center gap-1" title="로컬 저장 모드">
                        <CloudOff className="w-4 h-4" />
                        <span className="hidden md:inline">로컬 저장</span>
                      </span>
                    )}

                    <div className="text-stone-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Entry Expanded Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 space-y-5 bg-[#FCFCFB]">
                    {/* Activity Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                        <span className="font-medium text-stone-500">태그:</span>
                        {entry.tags.map((t, idx) => (
                          <span key={idx} className="text-stone-700">
                            {t}{idx < entry.tags.length - 1 ? ' ·' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Student Diary Content */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200">
                      <h4 className="text-xs font-semibold text-stone-500 mb-1.5">내가 쓴 일기</h4>
                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>

                    {/* AI Counselor Response Card */}
                    {entry.aiFeedback && (
                      <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/80 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                              다정이 선생님의 마음 답장
                            </h4>
                          </div>

                          <button
                            onClick={() => handlePlayAudio(entry)}
                            className="px-2.5 py-1 bg-white hover:bg-stone-50 rounded-lg text-xs font-medium text-stone-700 border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-stone-600" />
                            <span>소리로 듣기</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line pl-1">
                          {entry.aiFeedback.empathyMessage}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60 flex items-start gap-2">
                            <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <span className="font-semibold text-emerald-800 block">오늘의 마음 처방전</span>
                              <span className="text-stone-700">{entry.aiFeedback.advice}</span>
                            </div>
                          </div>

                          <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60 flex items-start gap-2">
                            <Award className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <span className="font-semibold text-purple-800 block">칭찬 한마디</span>
                              <span className="text-stone-700">{entry.aiFeedback.compliment}</span>
                            </div>
                          </div>
                        </div>

                        {entry.aiFeedback.quote && (
                          <div className="text-center text-xs italic text-stone-600 font-serif pt-1">
                            “{entry.aiFeedback.quote}”
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
