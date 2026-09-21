import React from 'react';

export default function TextInput({ text, setText, maxCharacters = 5000 }) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isNearLimit = text.length > maxCharacters * 0.9;
  const isOverLimit = text.length > maxCharacters;

  return (
    <section className="script-panel panel">
      <div className="panel-heading">
        <div className="panel-title-group">
          <h2>Input Script</h2>
          <span className="panel-subtitle">Type or paste text to synthesize</span>
        </div>
        {text && (
          <button 
            type="button" 
            className="clear-btn" 
            onClick={() => setText('')}
            title="Clear text"
          >
            Clear
          </button>
        )}
      </div>

      <div className="textarea-wrapper">
        <textarea
          value={text}
          maxLength={maxCharacters}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here to convert into natural speech..."
          aria-label="Text to convert to speech"
          rows={6}
        />
      </div>

      <div className="textarea-footer">
        <div className="counter-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>{wordCount} words</span>
        </div>

        <span className={`char-count ${isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''}`}>
          {text.length.toLocaleString()} / {maxCharacters.toLocaleString()} characters
        </span>
      </div>
    </section>
  );
}
