import React, { useState, useEffect } from 'react';

// 元件匯入
import Settings from './components/Settings';
import DreamInput from './components/DreamInput';
import DreamList from './components/DreamList';
import EventInput from './components/EventInput';
import EventList from './components/EventList';
import ReflectionReport from './components/ReflectionReport';
import './App.css';

// 服務邏輯
const dreamService = {
  getDreams: () => { const d = localStorage.getItem('dreams'); return d ? JSON.parse(d).sort((a, b) => new Date(b.date) - new Date(a.date)) : []; },
  saveDreams: (dreams) => localStorage.setItem('dreams', JSON.stringify(dreams))
};
const eventService = {
  getEvents: () => { const e = localStorage.getItem('realLifeEvents'); return e ? JSON.parse(e).sort((a, b) => new Date(b.date) - new Date(a.date)) : []; },
  saveEvents: (events) => localStorage.setItem('realLifeEvents', JSON.stringify(events))
};

function App() {
  const [dreams, setDreams] = useState(dreamService.getDreams());
  const [events, setEvents] = useState(eventService.getEvents());
  const [report, setReport] = useState(localStorage.getItem('lastReport') || '');
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  useEffect(() => { dreamService.saveDreams(dreams); }, [dreams]);
  useEffect(() => { eventService.saveEvents(events); }, [events]);
  useEffect(() => { localStorage.setItem('lastReport', report); }, [report]);

  const handleDataImport = (importedData) => {
    if (!importedData || typeof importedData !== 'object') {
      alert('匯入失敗：檔案格式不正確。');
      return;
    }
    if (window.confirm('你確定要從檔案匯入數據嗎？這將會覆蓋所有目前的紀錄和設定！')) {
      try {
        localStorage.setItem('appSettings', JSON.stringify(importedData.appSettings || {}));
        localStorage.setItem('dreams', JSON.stringify(importedData.dreams || []));
        localStorage.setItem('realLifeEvents', JSON.stringify(importedData.realLifeEvents || []));
        localStorage.setItem('lastReport', importedData.lastReport || '');
      } catch (error) {
        alert(`儲存匯入數據時出錯: ${error.message}`);
      }
    }
  };

  const analyzeDream = async (dream) => {
    const settings = JSON.parse(localStorage.getItem('appSettings'));
    if (!settings || !settings.apiKey) { throw new Error('API Key 未設定。請先到設定頁面完成設定。'); }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` };
    if (settings.apiUrl.includes('ngrok.io') || settings.apiUrl.includes('ngrok-free.app')) { headers['ngrok-skip-browser-warning'] = 'true'; }
    const PROMPT = `分析以下夢境描述。\n你的任務是提取關鍵符號和主要情緒。\n你【必須】只回傳一個符合以下結構的 JSON 物件，不要包含任何解釋、註解或其他文字。\n\nJSON 結構範例:\n{\n  "symbols": ["範例符號1", "範例符號2"],\n  "emotions": ["範例情緒1", "範例情緒2"]\n}\n\n夢境內容：\n${dream.rawContent}`;
    const dreamAnalysisFunction = { name: "dream_analysis", description: "從夢境描述中提取符號和情緒。", parameters: { type: "object", properties: { symbols: { type: "array", items: { type: "string" }, description: "夢中的關鍵象徵物" }, emotions: { type: "array", items: { type: "string" }, description: "夢境中的主要情緒" } }, required: ["symbols", "emotions"] } };
    try {
        const response = await fetch(`${settings.apiUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify({ model: settings.model, messages: [{ role: 'user', content: PROMPT }], functions: [dreamAnalysisFunction], function_call: "auto" }) });
        if (!response.ok) { const errorData = await response.json(); console.error("API Error Response:", errorData); throw new Error(errorData.error ? errorData.error.message : 'API 請求失敗'); }
        const data = await response.json();
        let jsonString = null;
        const functionCall = data.choices[0].message.function_call;
        if (functionCall && functionCall.arguments) { jsonString = functionCall.arguments; } else { const content = data.choices[0].message.content; if (content) { const match = content.match(/\{[\s\S]*\}/); if (match) { jsonString = match[0]; } } }
        if (jsonString) { try { const cleanedJsonString = jsonString.replace(/,\s*([\]\}])/g, '$1'); return JSON.parse(cleanedJsonString); } catch (e) { console.error("提取出的 JSON 字串解析失敗:", jsonString); throw new Error("AI 回應中的 JSON 格式無效。"); } } else { throw new Error("在 AI 的回應中找不到有效的 JSON 物件。"); }
    } catch (error) { console.error('分析請求過程中發生錯誤:', error); throw new Error(error.message); }
  };

  const handleAddDream = async (content) => {
    const newDream = { id: `dream-${Date.now()}`, date: new Date().toISOString(), rawContent: content, analysis: { status: 'pending', symbols: [], emotions: [], error: null } };
    setDreams(prevDreams => [newDream, ...prevDreams]);
    try { const analysisResult = await analyzeDream(newDream); setDreams(prevDreams => prevDreams.map(dream => dream.id === newDream.id ? { ...dream, analysis: { ...analysisResult, status: 'completed', error: null } } : dream));
    } catch (error) { console.error('分析失敗:', error); setDreams(prevDreams => prevDreams.map(dream => dream.id === newDream.id ? { ...dream, analysis: { ...dream.analysis, status: 'error', error: error.message } } : dream)); }
  };

  const handleAddEvent = (description, emotions) => {
    const newEvent = { id: `event-${Date.now()}`, date: new Date().toISOString(), description, emotions };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  const generateReflectionReport = async () => {
    setIsReportLoading(true); setReport(''); setReportError(null);
    const settings = JSON.parse(localStorage.getItem('appSettings'));
    if (!settings || !settings.apiKey) { setReportError('API Key 未設定。請先到設定頁面完成設定。'); setIsReportLoading(false); return; }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDreams = dreams.filter(d => new Date(d.date) > sevenDaysAgo && d.analysis.status === 'completed').map(d => `  - 夢境 (日期: ${new Date(d.date).toLocaleDateString()}, 情緒: ${d.analysis.emotions.join(', ')}, 符號: ${d.analysis.symbols.join(', ')}): ${d.rawContent}`).join('\n');
    const recentEvents = events.filter(e => new Date(e.date) > sevenDaysAgo).map(e => `  - 現實事件 (日期: ${new Date(e.date).toLocaleDateString()}, 情緒: ${e.emotions.join(', ')}): ${e.description}`).join('\n');
    if (!recentDreams && !recentEvents) { setReportError('最近7天內沒有足夠的數據來生成報告。'); setIsReportLoading(false); return; }
    const PROMPT = `你是一個 AI 內省輔助工具，嚴格運行在【真相模式】。\n你的目標是基於使用者提供的「夢境數據」和「現實事件數據」，進行客觀、結構化的分析。\n\n【你的任務】\n1. 尋找夢境與現實事件之間可能的關聯（例如時間、情緒、主題上的巧合）。\n2. 基於這些關聯，從以下三個維度提供洞察：\n    *   **行為模式 (Behavioral Patterns):** 使用者可能存在的、重複出現的應對方式或行為傾向。\n    *   **潛在情感連結 (Emotional Connections):** 某些現實情緒是如何在潛意識的夢境中被扭曲、放大或象徵化的。\n    *   **自我觀察的切入點 (Points for Self-Reflection):** 提出 2-3 個開放式、引導性的問題，幫助使用者進一步思考，而非給出結論。\n\n【嚴格規則】\n*   **嚴禁安慰性言論:** 不准說「一切都會好起來的」、「加油」等空泛的話。\n*   **嚴禁產生幻覺:** 只能根據提供的數據進行分析，若數據不足，需明確指出。\n*   **嚴禁給予建議:** 不要告訴使用者「你應該...」，而是提供觀察和問題。\n*   **使用 Markdown 格式化輸出:** 使用標題、粗體和列表讓報告清晰易讀。\n\n【使用者數據】\n---\n[夢境數據]\n${recentDreams || "無"}\n---\n[現實事件數據]\n${recentEvents || "無"}\n---\n\n請開始你的結構化分析。`;
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` }; if (settings.apiUrl.includes('ngrok.io') || settings.apiUrl.includes('ngrok-free.app')) { headers['ngrok-skip-browser-warning'] = 'true'; }
    try {
        const response = await fetch(`${settings.apiUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: "你是一個 AI 內省輔助工具，嚴格運行在【真相模式】。" }, { role: 'user', content: PROMPT }], temperature: 0.5, max_tokens: 1500 }) });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error ? errorData.error.message : 'API 請求失敗'); }
        const data = await response.json();
        setReport(data.choices[0].message.content);
    } catch (error) { setReportError(error.message); } finally { setIsReportLoading(false); }
  };

  const handleDeleteDream = (idToDelete) => {
    if (window.confirm('你確定要删除這條夢境紀錄嗎？')) {
      setDreams(prevDreams => prevDreams.filter(dream => dream.id !== idToDelete));
    }
  };

  const handleDeleteEvent = (idToDelete) => {
    if (window.confirm('你確定要删除這條事件紀錄嗎？')) {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== idToDelete));
    }
  };

  return (
    <div className="app-container">
      <header><h1>潛意識模型系統 V1</h1></header>
      <main>
        <ReflectionReport onGenerate={generateReflectionReport} report={report} isLoading={isReportLoading} error={reportError} />
        <div className="columns-container">
          <div className="column">
            <DreamInput onAddDream={handleAddDream} />
            <DreamList dreams={dreams} onDelete={handleDeleteDream} />
          </div>
          <div className="column">
            <EventInput onAddEvent={handleAddEvent} />
            <EventList events={events} onDelete={handleDeleteEvent} />
          </div>
        </div>
        <Settings onDataImport={handleDataImport} />
      </main>
    </div>
  );
}

export default App;