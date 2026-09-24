import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Lock,
  Globe,
  Sliders,
  Calendar,
  User,
  Heart,
  Tag,
  PenTool,
  Send,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { EMOTIONS, ACTIVITY_TAGS, WEATHER_OPTIONS } from '../data/emotions';
import { EmotionKey, WeatherType, DiaryEntry, AIAnalysisResult } from '../types/diary';
import { analyzeDiaryWithGemini } from '../services/apiClient';

interface DiaryWriterProps {
  studentName: string;
  gradeClass: string;
  onUpdateProfile: (name: string, gradeClass: string) => void;
  onAnalysisGenerated: (diary: DiaryEntry, analysis: AIAnalysisResult) => void;
}

export const DiaryWriter: React.FC<DiaryWriterProps> = ({
  studentName,
  gradeClass,
  onUpdateProfile,
  onAnalysisGenerated,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey>('happy');
  const [intensity, setIntensity] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>(['🏫 학교 수업']);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Voice STT State
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    setSttSupported(Boolean(SpeechRecognition));
  }, []);

  const handleToggleListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('사용하시는 브라우저에서는 음성 인식(STT) 기능을 지원하지 않습니다. Chrome 브라우저를 권장합니다.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setContent((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const currentEmotionMeta = EMOTIONS.find((e) => e.key === selectedEmotion) || EMOTIONS[0];

  const intensityLabels: Record<number, string> = {
    1: '1단계 · 살짝 스쳐 지나가요',
    2: '2단계 · 조금 느껴지는 정도예요',
    3: '3단계 · 적당히 마음에 머물러요',
    4: '4단계 · 꽤 크게 다가와요',
    5: '5단계 · 온 마음에 가득 차올라요',
  };

  const handleAnalyzeAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!content.trim()) {
      setErrorMessage('오늘 하루 어떤 일이 있었는지 일기 내용을 조금만 적어주세요.');
      return;
    }

    if (!studentName.trim()) {
      setErrorMessage('작성자(이름 또는 닉네임)를 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await analyzeDiaryWithGemini({
        studentName,
        gradeClass,
        date,
        emotionKey: selectedEmotion,
        emotionLabel: currentEmotionMeta.label,
        emotionIntensity: intensity,
        tags: selectedTags,
        title: title.trim() || `${date}의 마음일기`,
        content: content.trim(),
      });

      const newEntry: DiaryEntry = {
        id: `diary-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        date,
        studentName,
        gradeClass,
        weather,
        emotionKey: selectedEmotion,
        emotionLabel: currentEmotionMeta.label,
        emotionIntensity: intensity,
        tags: selectedTags,
        title: title.trim() || `${date}의 마음일기`,
        content: content.trim(),
        isPrivate,
        aiFeedback: analysis,
        createdAt: new Date().toISOString(),
        syncedToGAS: false,
      };

      onAnalysisGenerated(newEntry, analysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`AI 답장을 생성하는 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Step Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-600" />
            <span>오늘의 마음일기 쓰기</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            어떤 마음이든 괜찮아요. 솔직한 오늘의 기분을 기록해보세요.
          </p>
        </div>

        {/* Secret Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsPrivate(!isPrivate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto ${
            isPrivate
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
          title="비밀 일기로 설정하면 선생님 공유 목록에서 제외됩니다"
        >
          {isPrivate ? (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>나만 보기 (비밀 일기 모드)</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>선생님과 공유하기</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleAnalyzeAndSubmit} className="space-y-6">
        {/* Profile and Meta info: Name, Grade/Class, Date, Weather */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-50/70 p-4 rounded-xl border border-stone-200/60">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>학생 이름 / 별명</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => onUpdateProfile(e.target.value, gradeClass)}
              placeholder="예: 김민준"
              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          {/* Grade/Class */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              학년 / 학급
            </label>
            <input
              type="text"
              value={gradeClass}
              onChange={(e) => onUpdateProfile(studentName, e.target.value)}
              placeholder="예: 5학년 2반"
              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>날짜</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Weather */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              오늘의 날씨
            </label>
            <div className="flex items-center gap-1">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.type}
                  type="button"
                  onClick={() => setWeather(w.type)}
                  className={`flex-1 py-1.5 text-base rounded-md border text-center transition-all cursor-pointer ${
                    weather === w.type
                      ? 'bg-amber-100 border-amber-400 scale-105 shadow-xs'
                      : 'bg-white border-stone-200 hover:bg-stone-100'
                  }`}
                  title={w.label}
                >
                  {w.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1: Emotion Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>오늘 나의 마음을 가장 잘 나타내는 감정은?</span>
            </label>
            <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {currentEmotionMeta.emoji} {currentEmotionMeta.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {EMOTIONS.map((emo) => {
              const isSelected = selectedEmotion === emo.key;
              return (
                <button
                  key={emo.key}
                  type="button"
                  onClick={() => setSelectedEmotion(emo.key)}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${emo.bgColor} ring-2 ring-amber-500/40 shadow-xs scale-102`
                      : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-2xl">{emo.emoji}</span>
                  <span className={`text-xs font-semibold ${isSelected ? emo.textColor : 'text-stone-700'}`}>
                    {emo.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-stone-500 italic pl-1">
            💡 {currentEmotionMeta.description}
          </p>
        </div>

        {/* Section 2: Emotion Intensity Slider */}
        <div className="space-y-2 bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-stone-500" />
              <span>감정의 크기 (강도)</span>
            </label>
            <span className="font-bold text-amber-700">
              {intensityLabels[intensity]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-600 px-1 font-medium">
            <span>1 (조금)</span>
            <span>2</span>
            <span>3 (보통)</span>
            <span>4</span>
            <span>5 (매우 큼)</span>
          </div>
        </div>

        {/* Section 3: Activity Tags */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-stone-800 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-stone-500" />
            <span>오늘 어떤 활동과 관련된 마음인가요? (중복 선택 가능)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Title & Content */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              일기 제목 (선택)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 친구와 나눈 작은 비밀 이야기"
              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <span>오늘의 마음 이야기 (본문)</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Voice STT Control */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
                title={sttSupported ? '마이크로 말하면 자동으로 글이 적혀요' : '현재 브라우저 지원 여부 확인 필요'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>음성 녹음 중지</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-stone-600" />
                    <span>말로 적기 (음성 입력)</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 어떤 일이 있었나요? 그때 마음이 어땠나요? 자유롭게 적어보세요..."
              className="w-full p-3.5 bg-white rounded-xl border border-stone-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y"
              required
            />
          </div>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI 다정이가 소중한 마음을 읽고 공감 답장을 적고 있어요...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>AI 다정이의 따뜻한 공감 답장 받기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
