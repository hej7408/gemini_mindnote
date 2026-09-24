export type EmotionKey =
  | 'happy'       // 행복/기쁨 😄
  | 'proud'       // 뿌듯/성취 🌟
  | 'calm'        // 평온/차분 🌿
  | 'excited'     // 설렘/기대 🎈
  | 'grateful'    // 감사/따뜻 💖
  | 'anxious'     // 불안/걱정 🥺
  | 'angry'       // 화남/답답 😤
  | 'sad'         // 슬픔/우울 🌧️
  | 'tired'       // 피곤/지침 🥱
  | 'hurt';       // 서운/속상 💔

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'rainbow';

export interface EmotionMeta {
  key: EmotionKey;
  label: string;
  emoji: string;
  category: 'positive' | 'neutral' | 'difficult';
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
}

export interface AIAnalysisResult {
  empathyMessage: string;        // 학생 눈높이의 따뜻한 공감 답장
  advice: string;                // 실천하기 쉬운 작은 마음 처방전
  compliment: string;            // 학생의 행동과 장점에 대한 칭찬
  positiveScore: number;         // 긍정 감정 점수 (0-100)
  stressScore: number;           // 스트레스/부담 지수 (0-100)
  keywords: string[];            // 주요 감정 키워드 3가지
  quote: string;                 // 마음을 밝혀주는 오늘의 응원 한마디
  needsTeacherAttention?: boolean; // 상담사/선생님 관심 필요 여부
}

export interface DiaryEntry {
  id: string;
  date: string;                  // YYYY-MM-DD
  studentName: string;
  gradeClass: string;
  weather: WeatherType;
  emotionKey: EmotionKey;
  emotionLabel: string;
  emotionIntensity: number;      // 1 ~ 5
  tags: string[];
  title: string;
  content: string;
  isPrivate: boolean;            // 비밀 일기 여부 (true: 학생-AI만 / false: 선생님 공유)
  aiFeedback?: AIAnalysisResult;
  createdAt: string;             // ISO string
  syncedToGAS?: boolean;         // Google Apps Script 동기화 완료 여부
}

export interface GASConfig {
  webAppUrl: string;
  sheetName?: string;
  lastConnected?: string;
  autoSync: boolean;
}

export interface GASResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  diaries?: DiaryEntry[];
  totalRecords?: number;
  data?: T;
}
