import React, { useState } from 'react';

function DreamInput({ onAddDream }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return; // 防止提交空內容
    onAddDream(content);
    setContent(''); // 清空輸入框
  };

  return (
    <div className="dream-input-container">
      <h2>記錄一個新夢境</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在這裡詳細描述你的夢境..."
          rows="6"
        ></textarea>
        <button type="submit">儲存並分析夢境</button>
      </form>
    </div>
  );
}

export default DreamInput;