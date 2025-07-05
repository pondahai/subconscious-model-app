import React, { useRef } from 'react';

// onExport: 匯出數據的函式
// onImport: 匯入數據的函式
function DataManager({ onExport, onImport }) {
  // 使用 useRef 來參照隱藏的檔案輸入元素
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataToExport = onExport();
    // 將數據轉換為格式化的 JSON 字串
    const jsonString = JSON.stringify(dataToExport, null, 2);
    // 創建一個 Blob 物件
    const blob = new Blob([jsonString], { type: 'application/json' });
    // 創建一個 URL 來指向這個 Blob
    const url = URL.createObjectURL(blob);
    
    // 創建一個隱藏的下載連結
    const link = document.createElement('a');
    link.href = url;
    // 設定下載檔案的名稱
    link.download = `subconscious-model-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click(); // 模擬點擊以下載檔案
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    // 當點擊「匯入」按鈕時，觸發隱藏的檔案選擇器
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        // 呼叫父元件的 onImport 函式，並傳入解析後的數據
        onImport(importedData);
        alert('數據成功匯入！頁面將會重新整理以應用變更。');
        // 重新整理頁面以確保所有狀態都更新
        window.location.reload();
      } catch (error) {
        alert(`匯入失敗：檔案不是有效的 JSON 格式或格式不符。\n錯誤：${error.message}`);
      }
    };
    reader.readAsText(file);
    
    // 清空檔案輸入，以便下次可以選擇同一個檔案
    event.target.value = null; 
  };

  return (
    <div className="data-manager-container">
      <h3>數據管理</h3>
      <p>你可以將所有應用程式數據（包含設定、夢境和事件）匯出為一個檔案進行備份，或從備份檔案中匯入。</p>
      <button onClick={handleExport} className="data-button">匯出數據</button>
      <button onClick={handleImportClick} className="data-button import">匯入數據</button>
      {/* 這是一個隱藏的 input 元素，用於選擇檔案 */}
      <input 
        type="file" 
        accept=".json"
        ref={fileInputRef} 
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  );
}

export default DataManager;