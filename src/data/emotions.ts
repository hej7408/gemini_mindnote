import { EmotionMeta, WeatherType } from '../types/diary';

export const EMOTIONS: EmotionMeta[] = [
  {
    key: 'happy',
    label: '행복하고 기뻐요',
    emoji: '😄',
    category: 'positive',
    color: '#F59E0B',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    description: '입꼬리가 절로 올라가고 온 세상이 밝게 느껴져요.'
  },
  {
    key: 'proud',
    label: '뿌듯하고 성취감 넘쳐요',
    emoji: '🌟',
    category: 'positive',
    color: '#10B981',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    description: '노력해서 무언가를 해내어 내 자신이 대견해요.'
  },
  {
    key: 'calm',
    label: '평온하고 편안해요',
    emoji: '🌿',
    category: 'positive',
    color: '#059669',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    description: '마음이 잔잔한 호수처럼 여유롭고 안정돼요.'
  },
  {
    key: 'excited',
    label: '설레고 기대돼요',
    emoji: '🎈',
    category: 'positive',
    color: '#EC4899',
    textColor: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    description: '가슴이 두근두근, 재미있는 일이 기다려져요.'
  },
  {
    key: 'grateful',
    label: '감사하고 따뜻해요',
    emoji: '💖',
    category: 'positive',
    color: '#8B5CF6',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    description: '주변 사람들의 도움과 다정함에 고마움을 느껴요.'
  },
  {
    key: 'anxious',
    label: '불안하고 걱정돼요',
    emoji: '🥺',
    category: 'difficult',
    color: '#6366F1',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    description: '앞으로 일어날 일이나 시험, 관계가 신경 쓰여요.'
  },
  {
    key: 'angry',
    label: '화나고 답답해요',
    emoji: '😤',
    category: 'difficult',
    color: '#EF4444',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200 hover:border-red-400',
    description: '내 뜻대로 되지 않거나 억울해서 속이 부글거려요.'
  },
  {
    key: 'sad',
    label: '슬프고 우울해요',
    emoji: '🌧️',
    category: 'difficult',
    color: '#3B82F6',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    description: '눈물이 날 것 같고 마음이 텅 빈 것처럼 힘이 없어요.'
  },
  {
    key: 'tired',
    label: '피곤하고 지쳐요',
    emoji: '🥱',
    category: 'difficult',
    color: '#64748B',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300 hover:border-slate-400',
    description: '잠이 부족하거나 오늘 하루 에너지를 모두 썼어요.'
  },
  {
    key: 'hurt',
    label: '서운하고 속상해요',
    emoji: '💔',
    category: 'difficult',
    color: '#F43F5E',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    description: '친구의 말이나 행동에 상처받아 마음이 아파요.'
  }
];

export const ACTIVITY_TAGS = [
  '🏫 학교 수업',
  '👫 친구랑 대화',
  '🏡 가족과의 시간',
  '📝 시험/숙제',
  '⚽ 체육/운동',
  '🎨 취미/그리기',
  '🍱 맛있는 급식',
  '🎮 게임/유튜브',
  '📖 책 읽기',
  '👏 칭찬받은 일',
  '💭 나만의 비밀'
];

export const WEATHER_OPTIONS: { type: WeatherType; label: string; icon: string }[] = [
  { type: 'sunny', label: '맑음', icon: '☀️' },
  { type: 'cloudy', label: '구름', icon: '⛅' },
  { type: 'rainy', label: '비', icon: '🌧️' },
  { type: 'snowy', label: '눈', icon: '❄️' },
  { type: 'windy', label: '바람', icon: '💨' },
  { type: 'rainbow', label: '무지개', icon: '🌈' }
];

export const SAMPLE_DIARIES = [
  {
    id: 'sample-1',
    date: '2026-09-24',
    studentName: '김민준',
    gradeClass: '5학년 2반',
    weather: 'sunny' as WeatherType,
    emotionKey: 'proud' as const,
    emotionLabel: '뿌듯하고 성취감 넘쳐요',
    emotionIntensity: 5,
    tags: ['🏫 학교 수업', '📝 시험/숙제', '👏 칭찬받은 일'],
    title: '어려웠던 수학 문제를 드디어 혼자 풀었다!',
    content: '수학 시간에 분수의 나눗셈이 계속 헷갈려서 걱정이었는데, 방과 후에 혼자 3번 다시 풀어봤다. 마침내 원리를 이해하고 문제를 다 맞췄을 때 심장이 쿵쾅거릴 정도로 기뻤다. 선생님께서도 끈기 있게 노력했다고 칭찬 도장을 찍어주셨다. 포기하지 않길 정말 잘했다!',
    isPrivate: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiFeedback: {
      empathyMessage: '민준아, 정말 대단하고 멋지다! 👏 어려운 분수 나눗셈을 포기하지 않고 방과 후에 3번이나 스스로 다시 풀어보았다니, 그 끈기와 도전 정신에 박수를 보내고 싶어. 문제를 혼자 해결했을 때의 짜릿한 기쁨은 민준이가 흘린 땀방울이 선물해 준 거야.',
      advice: '오늘의 멋진 성취감을 잊지 않도록 수학 공책 맨 위에 "포기하지 않는 민준이 최고!"라고 작은 응원 스티커나 글을 남겨보자.',
      compliment: '어려운 상황을 회피하지 않고 끝까지 마주하여 스스로 돌파구를 찾아낸 놀라운 끈기!',
      positiveScore: 95,
      stressScore: 15,
      keywords: ['끈기', '성취감', '자신감'],
      quote: '작은 성공들이 모여 큰 기적을 만듭니다. 오늘 민준이는 스스로의 한계를 넘었어요!',
      needsTeacherAttention: false
    }
  },
  {
    id: 'sample-2',
    date: '2026-09-23',
    studentName: '이지우',
    gradeClass: '5학년 2반',
    weather: 'cloudy' as WeatherType,
    emotionKey: 'hurt' as const,
    emotionLabel: '서운하고 속상해요',
    emotionIntensity: 4,
    tags: ['👫 친구랑 대화', '🍱 맛있는 급식'],
    title: '점심시간에 친구가 장난을 쳤는데 속상했다',
    content: '급식실에서 급식을 받고 앉으려는데 단짝 친구가 내 반찬을 보고 장난스럽게 웃으며 놀렸다. 친구는 그냥 장난이었다고 하지만 내 앞에서는 너무 부끄럽고 얼굴이 빨개졌다. 말도 제대로 못 하고 식판만 보며 먹어서 밥맛도 없었다. 나중에 친구에게 솔직히 말해야 할지 고민된다.',
    isPrivate: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiFeedback: {
      empathyMessage: '지우야, 친구의 무심한 장난에 마음이 참 많이 다쳤겠구나. 🥺 급식실에서 부끄럽고 서운해서 밥도 제대로 못 먹었을 지우를 생각하니 다정이 선생님 마음도 찡해져. 친구에게 나쁜 의도가 없었더라도 지우가 상처받았다면 그건 분명 속상한 일이야.',
      advice: '내일 아침 친구에게 조용한 목소리로 "어제 네 장난 때문에 마음이 조금 속상했어. 다음엔 그러지 않아 줬으면 좋겠어"라고 지우의 마음을 솔직하게 표현해보면 어떨까?',
      compliment: '화내거나 다투지 않고 차분히 자신의 감정을 돌아보고 표현할 방법을 고민하는 지우의 성숙한 태도!',
      positiveScore: 35,
      stressScore: 75,
      keywords: ['서운함', '용기', '대화'],
      quote: '마음의 상처를 숨기지 않고 표현하는 것은 나 자신을 사랑하는 가장 큰 용기입니다.',
      needsTeacherAttention: true
    }
  },
  {
    id: 'sample-3',
    date: '2026-09-22',
    studentName: '박서현',
    gradeClass: '5학년 1반',
    weather: 'sunny' as WeatherType,
    emotionKey: 'calm' as const,
    emotionLabel: '평온하고 편안해요',
    emotionIntensity: 3,
    tags: ['📖 책 읽기', '🏡 가족과의 시간'],
    title: '도서관에서 좋아하는 소설책을 읽은 오후',
    content: '수업 끝나고 학교 도서관 구석 창가 자리에서 햇살을 받으며 소설책을 읽었다. 조용한 도서관에서 책장을 넘기는 소리만 들리는 그 시간이 참 따뜻했다. 집에 와서는 엄마가 깎아주신 사과를 먹으며 책 이야기를 나눴다. 평범하지만 감사한 하루다.',
    isPrivate: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aiFeedback: {
      empathyMessage: '서현이의 일기를 읽는 것만으로도 따뜻한 햇살과 바스락거리는 책장 소리가 들리는 듯 마음이 편안해져. 🌿 창가 자리에서 느끼는 고요함과 가족과 함께 나눈 달콤한 사과 시간까지, 소소한 일상에서 행복을 발견하는 서현이의 감성이 참 아름다워.',
      advice: '오늘 읽었던 책 중에서 가장 마음에 와닿았던 문장 하나를 다이어리 한 귀퉁이에 적어두어 나만의 마음 보물로 간직해보렴.',
      compliment: '일상의 잔잔한 순간들을 그냥 지나치지 않고 감사함으로 채울 줄 아는 따뜻한 마음의 눈!',
      positiveScore: 90,
      stressScore: 10,
      keywords: ['평온', '독서', '일상의행복'],
      quote: '행복은 거창한 것이 아니라, 조용히 책장을 넘기는 순간의 평화 속에 있습니다.',
      needsTeacherAttention: false
    }
  }
];
