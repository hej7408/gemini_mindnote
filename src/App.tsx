/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { DiaryWriter } from './components/DiaryWriter';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { DiaryTimeline } from './components/DiaryTimeline';
import { ClassroomAnalytics } from './components/ClassroomAnalytics';
import { GASSettingsModal } from './components/GASSettingsModal';
import { DiaryEntry, AIAnalysisResult, GASConfig } from './types/diary';
import {
  loadStoredDiaries,
  saveStoredDiaries,
  loadGASConfig,
  saveGASConfig,
} from './services/storage';
import { saveDiaryToGAS } from './services/apiClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'write' | 'timeline' | 'analytics' | 'gas'>('write');
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => loadStoredDiaries());
  const [gasConfig, setGasConfig] = useState<GASConfig>(() => loadGASConfig());

  // Student Profile
  const [studentName, setStudentName] = useState(() => localStorage.getItem('edutech_student_name') || '김민준');
  const [gradeClass, setGradeClass] = useState(() => localStorage.getItem('edutech_grade_class') || '5학년 2반');

  // Active AI Feedback State
  const [pendingDiary, setPendingDiary] = useState<DiaryEntry | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync diaries to localStorage whenever updated
  useEffect(() => {
    saveStoredDiaries(diaries);
  }, [diaries]);

  // Update profile
  const handleUpdateProfile = (name: string, gc: string) => {
    setStudentName(name);
    setGradeClass(gc);
    localStorage.setItem('edutech_student_name', name);
    localStorage.setItem('edutech_grade_class', gc);
  };

  // Save GAS config
  const handleSaveGASConfig = (newConfig: GASConfig) => {
    setGasConfig(newConfig);
    saveGASConfig(newConfig);
  };

  // When AI generates analysis
  const handleAnalysisGenerated = (entry: DiaryEntry, analysis: AIAnalysisResult) => {
    setPendingDiary(entry);
    setActiveAnalysis(analysis);
    setIsSaved(false);
  };

  // Save entry to timeline and sync to GAS if configured
  const handleSaveToTimeline = async () => {
    if (!pendingDiary) return;

    setIsSaving(true);
    let entryToSave = { ...pendingDiary };

    // If Google Apps Script is configured, auto sync
    if (gasConfig.webAppUrl) {
      try {
        const gasRes = await saveDiaryToGAS(gasConfig.webAppUrl, entryToSave);
        if (gasRes.status === 'success') {
          entryToSave.syncedToGAS = true;
        }
      } catch (err) {
        console.warn('Auto sync to GAS failed, saved locally:', err);
      }
    }

    setDiaries((prev) => [entryToSave, ...prev]);
    setIsSaving(false);
    setIsSaved(true);

    // Switch to timeline after short feedback
    setTimeout(() => {
      setCurrentTab('timeline');
      setActiveAnalysis(null);
      setPendingDiary(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          // If moving away from write, reset pending analysis
          if (tab !== 'write') {
            setActiveAnalysis(null);
          }
        }}
        gasConfig={gasConfig}
        onOpenGASSettings={() => setCurrentTab('gas')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Banner (Always visible or in write view) */}
        {currentTab === 'write' && (
          <HeroBanner
            studentName={studentName}
            totalEntries={diaries.length}
            onStartWriting={() => {
              const el = document.getElementById('diary-writer-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 1: Write Diary & AI Empathy Card */}
        {currentTab === 'write' && (
          <div id="diary-writer-container" className="space-y-8">
            <DiaryWriter
              studentName={studentName}
              gradeClass={gradeClass}
              onUpdateProfile={handleUpdateProfile}
              onAnalysisGenerated={handleAnalysisGenerated}
            />

            {/* AI Empathy Card (appears after submission) */}
            {activeAnalysis && pendingDiary && (
              <div id="ai-feedback-section">
                <AIAnalysisCard
                  analysis={activeAnalysis}
                  studentName={studentName}
                  emotionLabel={pendingDiary.emotionLabel}
                  onSaveToTimeline={handleSaveToTimeline}
                  isSaving={isSaving}
                  isSaved={isSaved}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Timeline */}
        {currentTab === 'timeline' && (
          <DiaryTimeline
            diaries={diaries}
            onOpenWriter={() => setCurrentTab('write')}
          />
        )}

        {/* Tab 3: Teacher / Counselor Analytics */}
        {currentTab === 'analytics' && (
          <ClassroomAnalytics
            diaries={diaries}
            onOpenGASSettings={() => setCurrentTab('gas')}
            gasConfigured={Boolean(gasConfig.webAppUrl)}
          />
        )}

        {/* Tab 4: Google Apps Script Backend Integration */}
        {currentTab === 'gas' && (
          <GASSettingsModal
            config={gasConfig}
            onSaveConfig={handleSaveGASConfig}
            diaries={diaries}
            onDiariesUpdated={(updated) => setDiaries(updated)}
          />
        )}
      </main>

      {/* Quiet Footer per anti-slop rules (no ornamental engine widgets) */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 제미나이 마음노트 · 학생들의 정서 안정과 인성 성장을 돕는 다정이 AI
          </p>
          <div className="flex items-center gap-4 text-stone-600">
            <span>Google AI Studio Gemini 연동</span>
            <span aria-hidden="true">·</span>
            <span>Google Apps Script 백엔드 지원</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
