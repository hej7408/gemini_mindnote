import { AIAnalysisResult, DiaryEntry, GASResponse } from '../types/diary';

export async function analyzeDiaryWithGemini(input: {
  studentName: string;
  gradeClass?: string;
  date: string;
  emotionKey: string;
  emotionLabel: string;
  emotionIntensity: number;
  tags?: string[];
  title?: string;
  content: string;
}): Promise<AIAnalysisResult> {
  const response = await fetch('/api/gemini/analyze-diary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `서버 오류 발생 (${response.status})`);
  }

  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.error || 'AI 분석에 실패했습니다.');
  }

  return result.data as AIAnalysisResult;
}

export async function testGASConnection(webAppUrl: string): Promise<GASResponse> {
  const response = await fetch('/api/gas/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webAppUrl }),
  });

  if (!response.ok) {
    throw new Error(`연결 실패: HTTP ${response.status}`);
  }

  return response.json();
}

export async function saveDiaryToGAS(webAppUrl: string, diary: DiaryEntry): Promise<GASResponse> {
  const response = await fetch('/api/gas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webAppUrl,
      payload: {
        action: 'saveDiary',
        diary: {
          id: diary.id,
          date: diary.date,
          studentName: diary.studentName,
          gradeClass: diary.gradeClass,
          weather: diary.weather,
          emotionKey: diary.emotionKey,
          emotionLabel: diary.emotionLabel,
          emotionIntensity: diary.emotionIntensity,
          tags: diary.tags,
          title: diary.title,
          content: diary.content,
          isPrivate: diary.isPrivate,
          aiEmpathy: diary.aiFeedback?.empathyMessage || '',
          aiAdvice: diary.aiFeedback?.advice || '',
          aiCompliment: diary.aiFeedback?.compliment || '',
          aiQuote: diary.aiFeedback?.quote || '',
          positiveScore: diary.aiFeedback?.positiveScore || 50,
          stressScore: diary.aiFeedback?.stressScore || 30,
          createdAt: diary.createdAt,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script 저장 실패: HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchDiariesFromGAS(webAppUrl: string): Promise<DiaryEntry[]> {
  const response = await fetch('/api/gas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webAppUrl,
      payload: { action: 'getDiaries' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script 조회 실패: HTTP ${response.status}`);
  }

  const result: GASResponse = await response.json();
  if (result.status === 'success' && Array.isArray(result.diaries)) {
    return result.diaries;
  }
  return [];
}
