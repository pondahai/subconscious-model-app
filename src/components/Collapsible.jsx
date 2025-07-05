import React, { useState } from 'react';

// props:
// - title: 顯示在收合/展開按鈕上的文字
// - children: 要被收合的內容
function Collapsible({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible-container">
      <button onClick={toggleVisibility} className="collapsible-header">
        {isOpen ? '▼' : '►'} {title}
      </button>
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default Collapsible;