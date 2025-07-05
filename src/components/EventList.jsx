import React from 'react';

// 新增 onDelete prop
function EventList({ events, onDelete }) {
  if (!events || events.length === 0) {
    return <div className="list-container"><p>還沒有任何現實事件紀錄。</p></div>;
  }

  return (
    <div className="list-container">
      <h2>現實事件日誌</h2>
      {events.map(event => (
        <div key={event.id} className="list-item">
          <button onClick={() => onDelete(event.id)} className="delete-button" title="刪除此紀錄">×</button>
          <strong>日期:</strong> {new Date(event.date).toLocaleString()}
          <p className="event-description">{event.description}</p>
          {event.emotions.length > 0 && (
            <div className="emotions-tags">
              <strong>情緒:</strong> {event.emotions.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EventList;