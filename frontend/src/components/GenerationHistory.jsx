import React from 'react';

export default function GenerationHistory({ history, onSelectHistory, onClearHistory }) {
  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <div className="panel-title-group">
          <h2>Generation History</h2>
          <span className="panel-subtitle">Recently synthesized audio clips</span>
        </div>
        {history && history.length > 0 && (
          <button
            type="button"
            className="clear-btn"
            onClick={onClearHistory}
            title="Clear all generation history"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="history-list-wrapper">
        {history && history.length > 0 ? (
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelectHistory(item)}
                title="Click to reload & play this clip"
              >
                <button
                  type="button"
                  className="history-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHistory(item);
                  }}
                  aria-label="Replay audio clip"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </button>

                <div className="history-content">
                  <p className="history-snippet">{item.text}</p>
                  <div className="history-meta">
                    <span className="history-voice-tag">{item.voiceName}</span>
                    <span className="history-time">{item.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history-state">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.4">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <p className="empty-history-text">No clips generated yet. Your session history will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
