import express, { Request, Response } from 'express';
import { analyzeDiaryContent } from './geminiService';
import { proxyToGAS } from './gasService';

export const apiApp = express();
apiApp.use(express.json());

// Endpoint for Gemini Diary Analysis
apiApp.post('/gemini/analyze-diary', async (req: Request, res: Response) => {
  try {
    const { studentName, gradeClass, date, emotionKey, emotionLabel, emotionIntensity, tags, title, content } = req.body;

    if (!content || !emotionKey) {
      return res.status(400).json({
        error: '일기 내용(content)과 감정(emotionKey)은 필수 항목입니다.'
      });
    }

    const analysis = await analyzeDiaryContent({
      studentName: studentName || '학생',
      gradeClass: gradeClass || '',
      date: date || new Date().toISOString().split('T')[0],
      emotionKey,
      emotionLabel: emotionLabel || emotionKey,
      emotionIntensity: Number(emotionIntensity) || 3,
      tags: tags || [],
      title: title || '',
      content: String(content)
    });

    return res.json({
      status: 'success',
      data: analysis
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[API Router] Error in analyze-diary:', errMsg);
    return res.status(500).json({
      status: 'error',
      error: `AI 마음 분석 중 오류가 발생했습니다: ${errMsg}`
    });
  }
});

// Endpoint for Google Apps Script Proxy
apiApp.post('/gas/proxy', async (req: Request, res: Response) => {
  try {
    const { webAppUrl, payload } = req.body;

    if (!webAppUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Google Apps Script Web App URL이 제공되지 않았습니다.'
      });
    }

    const gasResponse = await proxyToGAS(webAppUrl, payload);
    return res.json(gasResponse);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[API Router] Error in gas-proxy:', errMsg);
    return res.status(500).json({
      status: 'error',
      message: `Google Apps Script 연동 실패: ${errMsg}`
    });
  }
});

// Endpoint to test Google Apps Script Web App connection
apiApp.post('/gas/test-connection', async (req: Request, res: Response) => {
  try {
    const { webAppUrl } = req.body;

    if (!webAppUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Web App URL이 누락되었습니다.'
      });
    }

    const testResponse = await proxyToGAS(webAppUrl, { action: 'testConnection' });
    return res.json(testResponse);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      status: 'error',
      message: `연결 테스트 중 오류: ${errMsg}`
    });
  }
});

