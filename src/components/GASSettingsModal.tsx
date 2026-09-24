import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  UploadCloud,
  Send
} from 'lucide-react';
import { GASConfig, DiaryEntry } from '../types/diary';
import { testGASConnection, saveDiaryToGAS, fetchDiariesFromGAS } from '../services/apiClient';

interface GASSettingsModalProps {
  config: GASConfig;
  onSaveConfig: (config: GASConfig) => void;
  diaries: DiaryEntry[];
  onDiariesUpdated: (diaries: DiaryEntry[]) => void;
}

export const GASSettingsModal: React.FC<GASSettingsModalProps> = ({
  config,
  onSaveConfig,
  diaries,
  onDiariesUpdated,
}) => {
  const [urlInput, setUrlInput] = useState(config.webAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Complete Code.gs script for Google Apps Script Web App
  const gasScriptCode = `// ==============================================================
// [제미나이 마음노트] Google Apps Script (GAS) 백엔드 코드
// 1. 구글 스프레드시트 > 확장 프로그램 > Apps Script에 복사해 넣으세요.
// 2. [배포] > [새 배포] > 유형: "웹 앱" 선택
// 3. 액세스 권한: "모든 사용자(Anyone)" 선택 후 배포 URL을 복사하세요.
// ==============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }
    
    var action = params.action || "getDiaries";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("마음일기") || initSheet(ss);
    
    // 1. 연결 테스트
    if (action === "testConnection") {
      return createResponse({
        status: "success",
        message: "Google Apps Script 백엔드와 정상 연결되었습니다! 🎉",
        sheetName: sheet.getName(),
        totalRecords: Math.max(0, sheet.getLastRow() - 1)
      });
    }
    
    // 2. 마음일기 저장
    if (action === "saveDiary") {
      var d = params.diary;
      sheet.appendRow([
        d.id || "D-" + new Date().getTime(),
        d.date || new Date().toISOString().split("T")[0],
        d.studentName || "학생",
        d.gradeClass || "",
        d.weather || "sunny",
        d.emotionKey || "happy",
        d.emotionLabel || "행복",
        d.emotionIntensity || 3,
        d.tags ? (Array.isArray(d.tags) ? d.tags.join(", ") : d.tags) : "",
        d.title || "",
        d.content || "",
        d.isPrivate ? "비밀일기" : "공개(선생님열람)",
        d.aiEmpathy || "",
        d.aiAdvice || "",
        d.aiCompliment || "",
        d.aiQuote || "",
        d.positiveScore || 50,
        d.stressScore || 30,
        new Date().toISOString()
      ]);
      
      return createResponse({
        status: "success",
        message: "마음일기가 구글 스프레드시트에 성공적으로 저장되었습니다!",
        id: d.id
      });
    }
    
    // 3. 마음일기 목록 조회
    if (action === "getDiaries") {
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createResponse({ status: "success", diaries: [] });
      }
      
      var diaries = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        diaries.push({
          id: String(row[0]),
          date: String(row[1]),
          studentName: String(row[2]),
          gradeClass: String(row[3]),
          weather: String(row[4] || "sunny"),
          emotionKey: String(row[5]),
          emotionLabel: String(row[6]),
          emotionIntensity: Number(row[7]) || 3,
          tags: row[8] ? String(row[8]).split(", ") : [],
          title: String(row[9]),
          content: String(row[10]),
          isPrivate: row[11] === "비밀일기",
          aiFeedback: {
            empathyMessage: String(row[12] || ""),
            advice: String(row[13] || ""),
            compliment: String(row[14] || ""),
            quote: String(row[15] || ""),
            positiveScore: Number(row[16]) || 50,
            stressScore: Number(row[17]) || 30,
            keywords: [],
            needsTeacherAttention: Number(row[17]) >= 60
          },
          createdAt: String(row[18] || new Date().toISOString()),
          syncedToGAS: true
        });
      }
      return createResponse({ status: "success", diaries: diaries });
    }
    
    return createResponse({ status: "error", message: "알 수 없는 요청: " + action });
  } catch (error) {
    return createResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function initSheet(ss) {
  var sheet = ss.insertSheet("마음일기");
  sheet.appendRow([
    "ID", "날짜", "이름", "학년반", "날씨", "감정키", "감정명", "감정강도",
    "태그", "제목", "내용", "공개여부", "AI공감답장", "AI처방전",
    "AI칭찬", "AI명언", "긍정지수", "스트레스지수", "등록일시"
  ]);
  sheet.setFrozenRows(1);
  return sheet;
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gasScriptCode);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSaveAndTest = async () => {
    if (!urlInput.trim()) {
      onSaveConfig({
        ...config,
        webAppUrl: '',
      });
      setTestResult({
        success: false,
        message: 'Google Apps Script URL이 제거되었습니다. 로컬 모드로 동작합니다.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await testGASConnection(urlInput.trim());
      if (response.status === 'success') {
        onSaveConfig({
          ...config,
          webAppUrl: urlInput.trim(),
          lastConnected: new Date().toISOString(),
        });
        setTestResult({
          success: true,
          message: response.message || '구글 앱스 크립트와 성공적으로 연결되었습니다!',
        });
      } else {
        setTestResult({
          success: false,
          message: response.message || '연결 실패: 응답을 확인하세요.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `연결 오류: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Upload all local diaries to Google Sheet
  const handleBatchSync = async () => {
    if (!urlInput.trim()) {
      alert('먼저 Google Apps Script Web App URL을 설정하고 연결해주세요.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('스프레드시트에 마음일기를 전송하는 중...');

    try {
      let count = 0;
      const updated = [...diaries];

      for (let i = 0; i < updated.length; i++) {
        if (!updated[i].syncedToGAS) {
          await saveDiaryToGAS(urlInput.trim(), updated[i]);
          updated[i] = { ...updated[i], syncedToGAS: true };
          count++;
        }
      }

      onDiariesUpdated(updated);
      setSyncStatus(`${count}편의 마음일기가 구글 스프레드시트에 성공적으로 동기화되었습니다! ✨`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setSyncStatus(`동기화 중 오류: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch diaries from Google Sheet
  const handleFetchFromGAS = async () => {
    if (!urlInput.trim()) {
      alert('먼저 Google Apps Script Web App URL을 설정해주세요.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('구글 시트에서 최신 마음일기 목록을 불러오는 중...');

    try {
      const cloudDiaries = await fetchDiariesFromGAS(urlInput.trim());
      if (cloudDiaries.length > 0) {
        onDiariesUpdated(cloudDiaries);
        setSyncStatus(`구글 시트에서 총 ${cloudDiaries.length}편의 일기를 동기화했습니다!`);
      } else {
        setSyncStatus('구글 시트에 저장된 일기가 아직 없습니다.');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setSyncStatus(`조회 실패: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            <span>Google Apps Script (GAS) 백엔드 연동</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            학생들의 마음일기를 나만의 구글 스프레드시트에 안전하게 보관하고 관리하세요.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span>{config.webAppUrl ? 'GAS 연동 모드' : '로컬 스토리지 모드'}</span>
        </div>
      </div>

      {/* URL Input & Connection Tester */}
      <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1">
            Google Apps Script Web App URL
          </label>
          <p className="text-xs text-stone-500 mb-2">
            구글 스프레드시트의 [배포] &gt; [웹 앱]에서 발급받은 URL을 입력하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>연결 테스트 중...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>URL 저장 & 연결 테스트</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Batch Sync Action */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleBatchSync}
            disabled={isSyncing || !urlInput.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>로컬 일기 구글 시트로 일괄 업로드</span>
          </button>

          <button
            onClick={handleFetchFromGAS}
            disabled={isSyncing || !urlInput.trim()}
            className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>구글 시트에서 최신 데이터 불러오기</span>
          </button>
        </div>

        {syncStatus && (
          <p className="text-xs text-stone-600 font-medium">{syncStatus}</p>
        )}
      </div>

      {/* 4-Step Setup Tutorial */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Apps Script 백엔드 3분 설정 가이드</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
              <span>스프레드시트 및 스크립트 열기</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Google Drive에서 새 스프레드시트를 생성한 후, 상단 메뉴에서 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Code.gs 코드 붙여넣기</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              기존 코드를 지우고, 아래의 <strong className="text-amber-700">Code.gs 전체 코드</strong>를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">3</span>
              <span>웹 앱 배포 설정</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              우측 상단 <strong>[배포] &gt; [새 배포]</strong> 클릭 후 톱니바퀴에서 <strong>[웹 앱]</strong>을 선택합니다.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">4</span>
              <span>액세스 권한: 모든 사용자</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              액세스 권한을 <strong className="text-rose-600">"모든 사용자(Anyone)"</strong>로 설정한 뒤 배포하고, 생성된 웹 앱 URL을 복사해 위에 넣으세요!
            </p>
          </div>
        </div>
      </div>

      {/* Code.gs Viewer & One-Click Copy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <span>Code.gs 백엔드 소스 코드 (Google Apps Script용)</span>
          </label>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {hasCopiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>코드 전체 복사</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-stone-800 leading-relaxed">
          {gasScriptCode}
        </pre>
      </div>
    </div>
  );
};
