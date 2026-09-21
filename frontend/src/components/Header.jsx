import React from 'react';

export default function Header({ isBackendOnline, checkingBackend }) {
  return (
    <header className="topbar">
      <div className="brand-group">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
        </div>
        <span className="brand-name">Echo Studio</span>
        <span className="brand-badge">Spring Boot + React</span>
      </div>

      <div className="topbar-meta">
        <div className="status-container">
          <span className={`status-dot ${isBackendOnline ? 'online' : checkingBackend ? 'checking' : 'offline'}`} />
          <span className="status-text">
            {checkingBackend ? 'Connecting to Backend...' : isBackendOnline ? 'Java Spring Boot API Online' : 'Offline / Web Speech Fallback'}
          </span>
        </div>
      </div>
    </header>
  );
}
