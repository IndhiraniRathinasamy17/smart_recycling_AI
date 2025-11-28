import React from "react";
import "./Sidebar.css";

const Sidebar = ({ history, onNewChat, onSelectHistory }) => {
  return (
    <div className="sidebar-container">
      
      {/* Top Section */}
      <div className="sidebar-top">
        <h2 className="sidebar-title">Smart Recycling AI</h2>

        <button className="new-chat-btn" onClick={onNewChat}>
          + New Session
        </button>
      </div>

      {/* History Section */}
      <div className="sidebar-history">
        <h3 className="history-title">History</h3>

        {history.length === 0 ? (
          <p className="empty-history">No history yet.</p>
        ) : (
          <ul>
            {history.map((item, index) => (
              <li 
                key={index}
                className="history-item"
                onClick={() => onSelectHistory(item)}
              >
                <span className="history-icon">🗂</span>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
