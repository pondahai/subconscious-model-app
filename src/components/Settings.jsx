import React, { useState } from 'react';
import DataManager from './DataManager'; // 匯入 DataManager

const settingsService = { /* ... 保持不變 ... */ };

// onDataImport 是從 App.jsx 傳遞過來的
function Settings({ onDataImport }) {
  const [settings, setSettings] = useState(settingsService.getSettings());

  const handleChange = (e) => { /* ... 保持不變 ... */ };
  const handleSave = () => { /* ... 保持不變 ... */ };

  // 準備要匯出的所有數據
  const handleDataExport = () => {
    const allData = {
      appSettings: settingsService.getSettings(),
      dreams: JSON.parse(localStorage.getItem('dreams') || '[]'),
      realLifeEvents: JSON.parse(localStorage.getItem('realLifeEvents') || '[]'),
      lastReport: localStorage.getItem('lastReport') || ''
    };
    return allData;
  };

  return (
    <div className="settings-container">
      <h2>設定</h2>
      {/* ... 原本的設定輸入框 ... */}

      {/* 整合 DataManager */}
      <DataManager onExport={handleDataExport} onImport={onDataImport} />
    </div>
  );
}

// 為了讓 Settings.jsx 也能獨立運作，把所有函式完整貼上
const SettingsWithFullFunctions = ({ onDataImport }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : { apiUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o-mini' };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        alert('設定已儲存！');
    };

    const handleDataExport = () => {
        return {
            appSettings: JSON.parse(localStorage.getItem('appSettings') || '{}'),
            dreams: JSON.parse(localStorage.getItem('dreams') || '[]'),
            realLifeEvents: JSON.parse(localStorage.getItem('realLifeEvents') || '[]'),
            lastReport: localStorage.getItem('lastReport') || ''
        };
    };

    const apiKeyWarning = { color: 'red', fontSize: '12px', marginTop: '5px' };

    return (
        <div className="settings-container">
            <h2>設定</h2>
            <div>
                <label>API URL:</label>
                <input type="text" name="apiUrl" value={settings.apiUrl} onChange={handleChange} />
            </div>
            <div>
                <label>API Key:</label>
                <input type="password" name="apiKey" value={settings.apiKey} onChange={handleChange} />
                <p style={apiKeyWarning}><strong>安全警告：</strong>您的 API Key 將儲存在本機瀏覽器中。</p>
            </div>
            <div>
                <label>Model:</label>
                <input type="text" name="model" value={settings.model} onChange={handleChange} />
            </div>
            <button onClick={handleSave}>儲存設定</button>

            <DataManager onExport={handleDataExport} onImport={onDataImport} />
        </div>
    );
};

export default SettingsWithFullFunctions;