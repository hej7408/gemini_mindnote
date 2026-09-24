import React from 'react';
import { BookHeart, Sparkles, Cloud, Database, BarChart3, PenLine } from 'lucide-react';
import { GASConfig } from '../types/diary';

interface HeaderProps {
  currentTab: 'write' | 'timeline' | 'analytics' | 'gas';
  onSelectTab: (tab: 'write' | 'timeline' | 'analytics' | 'gas') => void;
  gasConfig: GASConfig;
  onOpenGASSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  gasConfig,
  onOpenGASSettings,
}) => {
  const isGasConfigured = Boolean(gasConfig.webAppUrl);

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('write')}
          className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
            <BookHeart className="w-5 h-5 text-amber-600 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
            제미나이 마음노트
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onSelectTab('write')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentTab === 'write'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span>일기 쓰기</span>
          </button>

          <button
            onClick={() => onSelectTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentTab === 'timeline'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookHeart className="w-4 h-4" />
            <span>내 마음 기록</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">학급 돋보기</span>
            <span className="sm:hidden">학급분석</span>
          </button>

          <button
            onClick={() => onSelectTab('gas')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentTab === 'gas'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">앱스크립트 연동</span>
            <span className="sm:hidden">GAS</span>
          </button>
        </nav>

        {/* Zone 3: Primary action button / connection indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGASSettings}
            className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
              isGasConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
            }`}
            title="Google Apps Script 백엔드 설정 열기"
          >
            <Cloud className={`w-3.5 h-3.5 ${isGasConfigured ? 'text-emerald-600' : 'text-stone-500'}`} />
            <span className="font-medium whitespace-nowrap">
              {isGasConfigured ? 'GAS 연결됨' : 'GAS 미연동 (로컬)'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
