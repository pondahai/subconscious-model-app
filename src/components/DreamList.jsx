import React from 'react';

// 新增 onDelete prop
function DreamList({ dreams, onDelete }) { 
  if (!dreams || dreams.length === 0) {
    return <div className="list-container"><p>還沒有任何夢境紀錄。</p></div>;
  }

  return (
    <div className="list-container">
      <h2>夢境日誌</h2>
      {dreams.map(dream => (
        <div key={dream.id} className="list-item">
          <button onClick={() => onDelete(dream.id)} className="delete-button" title="刪除此紀錄">×</button>
          <strong>日期:</strong> {new Date(dream.date).toLocaleString()}
          <p className="dream-content">{dream.rawContent}</p>
          <div className="analysis-result">
            {dream.analysis.status === 'pending' && '分析中...'}
            {dream.analysis.status === 'completed' && (
              <>
                <div><strong>符號:</strong> {dream.analysis.symbols.join(', ')}</div>
                <div><strong>情緒:</strong> {dream.analysis.emotions.join(', ')}</div>
              </>
            )}
            {dream.analysis.status === 'error' && <div className="error">分析失敗: {dream.analysis.error}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DreamList;