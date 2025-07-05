import React from 'react';
import { marked } from 'marked';
import Collapsible from './Collapsible'; // 匯入我們的新元件

function ReflectionReport({ onGenerate, report, isLoading, error }) {
  
  const parseReport = (text) => {
    if (!text) return null;

    // 使用正規表示式來尋找並提取 <think> 區塊的內容
    const thinkRegex = /<think>([\s\S]*)<\/think>/;
    const match = text.match(thinkRegex);

    if (match) {
      const thinkContent = match[1]; // 標籤內的內容
      const mainContent = text.replace(thinkRegex, '').trim(); // 移除 think 區塊後剩下的內容

      return {
        main: mainContent,
        think: thinkContent,
      };
    }

    // 如果沒有找到 <think> 標籤，則全部都是主要內容
    return { main: text, think: null };
  };

  const reportParts = parseReport(report);

  const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };
    // 我們依然使用 marked 來解析 Markdown
    return { __html: marked(markdownText, { sanitize: true }) };
  };

  return (
    <div className="reflection-container">
      <h2>生成內省報告</h2>
      <p>點擊按鈕，系統將整合你最近的夢境和現實事件，生成一份基於「真相模式」的結構化反思報告。</p>
      <button onClick={onGenerate} disabled={isLoading}>
        {isLoading ? '報告生成中...' : '開始生成'}
      </button>

      <div className="report-content">
        {error && <div className="error">生成失敗: {error}</div>}
        
        {reportParts && (
          <>
            {/* 顯示思考過程 (如果存在) */}
            {reportParts.think && (
              <Collapsible title="顯示/隱藏 AI 思考過程">
                <div dangerouslySetInnerHTML={createMarkup(reportParts.think)} />
              </Collapsible>
            )}

            {/* 顯示主要報告內容 */}
            <div dangerouslySetInnerHTML={createMarkup(reportParts.main)} />
          </>
        )}
      </div>
    </div>
  );
}

export default ReflectionReport;