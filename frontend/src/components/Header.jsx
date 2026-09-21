import React from 'react';

export default function Header({ isBackendOnline, checkingBackend }) {
  return (
    <header className="topbar">
      <div className="brand-group">
        <div className="brand-sound-motif">
          <div className="sound-ring ring-2" />
          <div className="sound-ring ring-1" />
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
        </div>
        <div className="brand-titles">
          <span className="brand-name">ECHO STUDIO</span>
          <span className="brand-tagline">SPRING BOOT + REACT</span>
        </div>
      </div>

      <div className="topbar-meta">
        <div className="status-container">
          <span className={`status-dot ${isBackendOnline ? 'online' : checkingBackend ? 'checking' : 'offline'}`} />
          <span className="status-text">
            {checkingBackend ? 'Connecting...' : isBackendOnline ? 'API Connected' : 'Offline Mode'}
          </span>
        </div>
      </div>
    </header>
  );
}
