import React, { useState } from 'react';

function EventInput({ onAddEvent }) {
  const [description, setDescription] = useState('');
  const [emotions, setEmotions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    // 將逗號分隔的情緒字串轉換為陣列
    const emotionsArray = emotions.split(',').map(e => e.trim()).filter(e => e);
    onAddEvent(description, emotionsArray);
    setDescription('');
    setEmotions('');
  };

  return (
    <div className="event-input-container">
      <h2>記錄一個現實事件</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="在這裡描述發生的事件..."
          rows="3"
        ></textarea>
        <input
          type="text"
          value={emotions}
          onChange={(e) => setEmotions(e.target.value)}
          placeholder="相關情緒 (用逗號分隔, 如: 開心, 輕鬆)..."
        />
        <button type="submit">儲存事件</button>
      </form>
    </div>
  );
}

export default EventInput;