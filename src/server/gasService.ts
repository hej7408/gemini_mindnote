import { DiaryEntry, GASResponse } from '../types/diary';

export async function proxyToGAS(
  webAppUrl: string,
  payload: { action: string; diary?: DiaryEntry; [key: string]: unknown }
): Promise<GASResponse> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      status: 'error',
      message: '유효한 Google Apps Script Web App URL(https://script.google.com/macros/s/.../exec)을 입력해주세요.'
    };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS handles text/plain without CORS preflight issues
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `Google Apps Script 서버 응답 오류 (HTTP ${response.status})`
      };
    }

    const data = await response.json();
    return data as GASResponse;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[GASService] Error proxying to GAS:', errMsg);
    return {
      status: 'error',
      message: `Google Apps Script 통신 실패: ${errMsg}`
    };
  }
}
