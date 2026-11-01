import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

function hasValidApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY');
}

function getGenAIClient(): GoogleGenAI | null {
  if (!hasValidApiKey()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Health & AI Status Endpoint
  app.get('/api/ai/status', (_req, res) => {
    const configured = hasValidApiKey();
    res.json({
      configured,
      model: GEMINI_MODEL,
      mode: configured ? 'gemini-live' : 'deterministic-fallback',
    });
  });

  // 2. Conversational Financial Assistant Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, financialContext } = req.body || {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(200).json({ reply: '', isFallback: true });
        return;
      }

      const systemInstruction = [
        'You are Campus Finance Buddy, an intelligent, trustworthy financial assistant built for college students in India.',
        'All monetary values are in Indian Rupees (INR / ₹).',
        'STRICT RULES:',
        '1. Use ONLY the exact numbers provided in the student financial context below. Never invent or alter their allowance, total expenses, remaining balance, or category totals.',
        '2. Never perform custom arithmetic that contradicts the provided financial context.',
        '3. If the student asks how to save ₹500 next month while keeping Education unchanged (with ₹8,000 allowance and ₹6,800 expenses), recommend: Food ₹2,400 -> ₹2,200 (-₹200), Travel ₹800 -> ₹700 (-₹100), Education ₹1,200 (unchanged), Shopping ₹1,000 -> ₹800 (-₹200), Entertainment ₹900 (unchanged), Other ₹500 (unchanged), resulting in ₹6,300 revised expenses and ₹1,700 remaining balance.',
        '4. Never ask for passwords, OTPs, UPI PINs, or bank credentials. Never claim access to real bank accounts or guarantee investment returns.',
        '5. Keep answers concise, clear, structured with bullet points, and directly tailored to Indian campus life (hostel mess, metro pass, textbooks, UPI budgeting).',
        '',
        `STUDENT FINANCIAL CONTEXT (ACTUAL STORED DATA):`,
        JSON.stringify(financialContext || {}, null, 2),
      ].join('\n');

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: message,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const replyText = response.text || '';
      res.json({
        reply: replyText,
        isFallback: !replyText,
      });
    } catch (error) {
      console.error('Gemini chat endpoint fallback triggered:', error);
      res.status(200).json({ reply: '', isFallback: true });
    }
  });

  // 3. Budget Planner Explanation Endpoint (Deterministic Math + AI Explanation)
  app.post('/api/ai/budget-rationale', async (req, res) => {
    try {
      const { plan } = req.body || {};
      if (!plan) {
        res.status(400).json({ error: 'Budget plan payload required' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(200).json({ summary: '', isFallback: true });
        return;
      }

      const prompt = [
        'Explain the following deterministically calculated student budget revision in 3–4 concise sentences.',
        'Do NOT alter any numbers. Cite the exact INR figures from the JSON below, explain the practical student trade-offs (e.g. trimming food delivery, grouping travel, pausing impulse shopping while protecting education), and highlight the new remaining balance.',
        JSON.stringify(plan, null, 2),
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'You are Campus Finance Buddy. You explain deterministic student budget optimizations clearly and concisely using exact INR numbers provided.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const summary = response.text || '';
      res.json({
        summary,
        isFallback: !summary,
      });
    } catch (error) {
      console.error('Gemini budget rationale fallback triggered:', error);
      res.status(200).json({ summary: '', isFallback: true });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Finance Buddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
