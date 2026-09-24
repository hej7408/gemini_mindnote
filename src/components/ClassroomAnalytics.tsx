import React, { useState } from 'react';
import {
  BarChart3,
  HeartHandshake,
  AlertCircle,
  Download,
  Users,
  CheckCircle,
  TrendingUp,
  Smile,
  Frown,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { DiaryEntry } from '../types/diary';
import { EMOTIONS } from '../data/emotions';

interface ClassroomAnalyticsProps {
  diaries: DiaryEntry[];
  onOpenGASSettings: () => void;
  gasConfigured: boolean;
}

export const ClassroomAnalytics: React.FC<ClassroomAnalyticsProps> = ({
  diaries,
  onOpenGASSettings,
  gasConfigured,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'attention' | 'positive'>('all');

  // Filter public entries for teacher/counselor review
  const shareableDiaries = diaries.filter((d) => !d.isPrivate);

  // Identify students needing attention (difficult emotions or high stress)
  const attentionNeededDiaries = shareableDiaries.filter((d) => {
    const isDifficult = ['anxious', 'angry', 'sad', 'tired', 'hurt'].includes(d.emotionKey);
    const highStress = (d.aiFeedback?.stressScore || 0) >= 60;
    const flagged = Boolean(d.aiFeedback?.needsTeacherAttention);
    return isDifficult || highStress || flagged;
  });

  const positiveDiaries = shareableDiaries.filter((d) => {
    return ['happy', 'proud', 'calm', 'excited', 'grateful'].includes(d.emotionKey);
  });

  const displayList =
    activeFilter === 'attention'
      ? attentionNeededDiaries
      : activeFilter === 'positive'
      ? positiveDiaries
      : shareableDiaries;

  // Emotion count breakdown
  const emotionCounts: Record<string, number> = {};
  shareableDiaries.forEach((d) => {
    emotionCounts[d.emotionKey] = (emotionCounts[d.emotionKey] || 0) + 1;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      '일시',
      '이름',
      '학급',
      '날씨',
      '감정',
      '감정강도',
      '제목',
      '내용',
      '긍정점수',
      '스트레스점수',
      '상담사관심필요',
    ];

    const rows = shareableDiaries.map((d) => [
      `"${d.date}"`,
      `"${d.studentName}"`,
      `"${d.gradeClass || ''}"`,
      `"${d.weather}"`,
      `"${d.emotionLabel}"`,
      `"${d.emotionIntensity}"`,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      `"${(d.content || '').replace(/"/g, '""')}"`,
      `"${d.aiFeedback?.positiveScore || ''}"`,
      `"${d.aiFeedback?.stressScore || ''}"`,
      `"${d.aiFeedback?.needsTeacherAttention ? '관심필요' : '일반'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `마음일기_학급감정분석_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xl">
            <Users className="w-5 h-5 text-amber-600" />
            <span>선생님 · 학급 마음 돋보기</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            학생들이 공유한 마음일기와 감정 흐름을 모니터링하여 조기 심리 케어와 상담을 지원합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV 다운로드</span>
          </button>

          <button
            onClick={onOpenGASSettings}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{gasConfigured ? '구글 시트 연동 중' : '구글 시트 백엔드 설정'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Diaried */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>공개된 마음일기</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
            {shareableDiaries.length}
            <span className="text-sm font-normal text-stone-500 ml-1">편</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            (비밀일기 {diaries.length - shareableDiaries.length}편 보호됨)
          </div>
        </div>

        {/* Positive Ratio */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>긍정·안정 감정 비율</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {shareableDiaries.length > 0
              ? Math.round((positiveDiaries.length / shareableDiaries.length) * 100)
              : 0}
            %
          </div>
          <div className="text-xs text-stone-500 mt-1">
            기쁨, 뿌듯, 평온, 설렘, 감사
          </div>
        </div>

        {/* Attention Needed */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>따뜻한 관심 필요 친구</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {attentionNeededDiaries.length}
            <span className="text-sm font-normal text-stone-500 ml-1">명</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            서운함, 불안, 슬픔, 높은 스트레스 감지
          </div>
        </div>
      </div>

      {/* Emotion Distribution Bar Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          <span>학급 감정 분포 현황</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {EMOTIONS.map((emo) => {
            const count = emotionCounts[emo.key] || 0;
            const pct =
              shareableDiaries.length > 0
                ? Math.round((count / shareableDiaries.length) * 100)
                : 0;

            return (
              <div
                key={emo.key}
                className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{emo.emoji}</span>
                  <span className="text-xs font-semibold text-stone-700 font-mono tabular-nums">
                    {count}건
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-stone-600 font-medium block truncate">
                    {emo.label.split(' ')[0]}
                  </span>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Student Diary List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Interactive Filter Controls */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              전체 보기 ({shareableDiaries.length})
            </button>
            <button
              onClick={() => setActiveFilter('attention')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'attention'
                  ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>관심 필요 ({attentionNeededDiaries.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('positive')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeFilter === 'positive'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              긍정·행복 ({positiveDiaries.length})
            </button>
          </div>

          <span className="text-xs text-stone-500">
            총 {displayList.length}명의 기록이 표시됩니다.
          </span>
        </div>

        {/* List of Entries */}
        <div className="divide-y divide-stone-100">
          {displayList.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-stone-500">
              해당 분류의 마음일기가 없습니다.
            </div>
          ) : (
            displayList.map((entry) => {
              const emo = EMOTIONS.find((e) => e.key === entry.emotionKey) || EMOTIONS[0];
              const isAttention =
                ['anxious', 'angry', 'sad', 'tired', 'hurt'].includes(entry.emotionKey) ||
                (entry.aiFeedback?.stressScore || 0) >= 60 ||
                entry.aiFeedback?.needsTeacherAttention;

              return (
                <div key={entry.id} className="p-5 hover:bg-stone-50/60 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{emo.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">
                            {entry.studentName}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            {entry.gradeClass || '5학년'}
                          </span>
                          {isAttention && (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              따뜻한 관심 필요
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          <span>{entry.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{emo.label}</span>
                          <span aria-hidden="true">·</span>
                          <span>강도 {entry.emotionIntensity}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block font-mono">
                        스트레스: {entry.aiFeedback?.stressScore ?? 30}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 pl-9">
                    {entry.content}
                  </p>

                  {entry.aiFeedback?.advice && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 ml-9 flex items-start gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>AI 다정이의 처방:</strong> {entry.aiFeedback.advice}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
