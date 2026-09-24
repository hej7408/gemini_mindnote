import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysisResult } from '../types/diary';

// Initialize Gemini SDK with telemetry header per gemini-api skill
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[GeminiService] GEMINI_API_KEY is not set in environment.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function analyzeDiaryContent(input: {
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
  const ai = getGeminiClient();

  // If no API key is available or in development fallback, provide empathetic heuristic feedback
  if (!ai) {
    return generateFallbackAnalysis(input);
  }

  const prompt = `
당신은 대한민국 학교 현장의 친절하고 다정한 'AI 마음 상담 선생님(애칭: 다정이)'입니다.
초·중·고등학생이 쓴 마음일기를 읽고, 심리학적 정서 수용(Empathic Validation)과 긍정 심리학에 기반하여 따뜻한 공감의 편지와 마음 처방전을 작성해주세요.

[학생 일기 정보]
- 작성자: ${input.studentName || '학생'} (${input.gradeClass || '학급 미입력'})
- 작성일자: ${input.date}
- 선택한 감정: ${input.emotionLabel} (${input.emotionKey}, 강도 1~5 중 ${input.emotionIntensity})
- 주요 활동 태그: ${input.tags && input.tags.length > 0 ? input.tags.join(', ') : '없음'}
- 일기 제목: ${input.title || '무제'}
- 일기 내용:
"""
${input.content}
"""

[작성 가이드라인]
1. empathyMessage (공감 답장):
   - 학생의 이름을 부르며 시작하는 정다운 편지 형태 (존댓말, 친근하고 다정한 선생님 말투).
   - 학생이 겪은 상황과 감정을 있는 그대로 인정(Validation)하고 따뜻하게 안아주는 3~5문장의 글.
   - 섣부른 훈계나 비난은 절대 금지.
2. advice (마음 처방전):
   - 오늘 또는 내일 학생이 부담 없이 실천해볼 수 있는 구체적이고 작은 행동 1~2가지 (예: 심호흡 3번 하기, 좋아하는 음악 듣기, 친구에게 건넬 따뜻한 말 한마디 등).
3. compliment (오늘의 칭찬):
   - 일기에서 드러난 학생의 정직함, 끈기, 배려심, 솔직함 등 장점 칭찬 (1~2문장).
4. positiveScore (0~100):
   - 일기에 담긴 긍정 정서의 대략적인 수치.
5. stressScore (0~100):
   - 일기에서 감지되는 스트레스 또는 정서적 부담감 수치.
6. keywords:
   - 학생의 감정 상태를 요약하는 핵심 키워드 3개 (예: ["성취감", "자신감", "행복"] 또는 ["서운함", "대화필요", "용기"]).
7. quote:
   - 위로와 희망을 전하는 따뜻한 격언이나 응원의 한마디.
8. needsTeacherAttention:
   - 심각한 우울, 지속적 괴롭힘, 극심한 불안, 자해/학교폭력 징후 등 담임 선생님이나 전문 상담사의 관심 및 개입이 필요한 경우 true, 일반적인 감정은 false.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an empathetic, licensed educational counselor and child-friendly AI mentor for school students in South Korea. Always respond in fluent, gentle Korean.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empathyMessage: { type: Type.STRING, description: '따뜻한 공감 답장' },
            advice: { type: Type.STRING, description: '구체적이고 실천하기 쉬운 작은 마음 처방전' },
            compliment: { type: Type.STRING, description: '학생의 장점과 노력에 대한 구체적 칭찬' },
            positiveScore: { type: Type.INTEGER, description: '긍정 지수 (0-100)' },
            stressScore: { type: Type.INTEGER, description: '스트레스/부담 지수 (0-100)' },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '감정 키워드 3가지'
            },
            quote: { type: Type.STRING, description: '따뜻한 응원 명언' },
            needsTeacherAttention: { type: Type.BOOLEAN, description: '선생님/상담사 상담 관심 필요 여부' }
          },
          required: ['empathyMessage', 'advice', 'compliment', 'positiveScore', 'stressScore', 'keywords', 'quote', 'needsTeacherAttention']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned empty text');
    }

    const parsed = JSON.parse(text) as AIAnalysisResult;
    return parsed;
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini API:', error);
    return generateFallbackAnalysis(input);
  }
}

function generateFallbackAnalysis(input: {
  studentName: string;
  emotionKey: string;
  emotionLabel: string;
  emotionIntensity: number;
  content: string;
}): AIAnalysisResult {
  const name = input.studentName || '친구';
  const isDifficult = ['anxious', 'angry', 'sad', 'tired', 'hurt'].includes(input.emotionKey);

  if (isDifficult) {
    return {
      empathyMessage: `${name}야, 오늘 마음속에 많은 생각과 힘든 감정들이 머물렀구나. 🥺 솔직하게 자신의 감정을 털어놓는 것은 아주 큰 용기가 필요한 일인데, 이렇게 일기에 적어주어서 정말 고마워. 다정이 선생님이 언제나 네 편에서 응원하고 있다는 걸 기억해줘.`,
      advice: '따뜻한 물 한 잔을 마시며 가슴에 손을 얹고 천천히 3초간 숨을 들이마시고 내쉬어보자. 오늘 밤은 푹 자며 마음을 편안히 쉬어주길 바라.',
      compliment: '자신의 어려운 감정을 피하지 않고 마주하며 글로 정리해낸 솔직함과 용기!',
      positiveScore: Math.max(10, 45 - input.emotionIntensity * 5),
      stressScore: Math.min(95, 50 + input.emotionIntensity * 9),
      keywords: ['마음돌봄', '휴식', '용기'],
      quote: '흐린 날 뒤에는 언제나 맑은 하늘과 예쁜 무지개가 기다리고 있단다.',
      needsTeacherAttention: input.emotionIntensity >= 4
    };
  } else {
    return {
      empathyMessage: `${name}야! 오늘 일기를 읽는 것만으로도 ${name}의 밝고 따뜻한 에너지가 전해져서 선생님도 덩달아 미소가 지어져. ✨ 오늘처럼 마음이 기쁘고 보람찬 날의 기분을 오래오래 간직하면 좋겠다.`,
      advice: '오늘 있었던 기분 좋은 일을 가족이나 친한 친구에게도 이야기하며 기쁨을 두 배로 나누어보자!',
      compliment: '주변의 긍정적인 순간을 발견하고 감사할 줄 아는 반짝이는 마음씨!',
      positiveScore: Math.min(100, 60 + input.emotionIntensity * 8),
      stressScore: Math.max(5, 30 - input.emotionIntensity * 5),
      keywords: ['기쁨', '성장', '감사'],
      quote: '기쁨은 나눌수록 커지고, 마음의 햇살은 내일을 더 환하게 비춥니다.',
      needsTeacherAttention: false
    };
  }
}
