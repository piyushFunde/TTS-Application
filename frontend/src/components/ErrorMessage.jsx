import React from 'react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="error-alert-banner" role="alert">
      <div className="error-alert-content">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div className="error-details">
          <strong>{error.title || 'Speech Synthesis Notice'}</strong>
          <p>{error.message || error}</p>
        </div>
      </div>
      {onDismiss && (
        <button type="button" className="error-dismiss-btn" onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      )}
    </div>
  );
}
