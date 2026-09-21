import React from 'react';

export default function VoiceSelector({
  voices,
  selectedVoiceId,
  setSelectedVoiceId,
  selectedLang,
  speed,
  setSpeed,
  pitch,
  setPitch
}) {
  const filteredVoices = voices.filter((v) => {
    if (!selectedLang || selectedLang === 'ALL') return true;
    return v.languageCode === selectedLang || v.language === selectedLang || (v.language && v.language.includes(selectedLang));
  });

  const activeVoicesList = filteredVoices.length > 0 ? filteredVoices : voices;
  const currentVoice = voices.find((v) => v.id === selectedVoiceId) || activeVoicesList[0];

  const previewVoice = (e) => {
    if (e) e.preventDefault();
    if ('speechSynthesis' in window && currentVoice) {
      window.speechSynthesis.cancel();
      const sampleText = currentVoice.sampleText || `Hello, this is a ${currentVoice.gender || ''} voice sample in ${currentVoice.language}.`;
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = speed || 1.0;
      utterance.pitch = pitch || 1.0;
      utterance.lang = currentVoice.languageCode || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatVoiceLabel = (v) => {
    const genderStr = v.gender ? v.gender : 'Voice';
    if (selectedLang && selectedLang !== 'ALL') {
      return `${genderStr} Voice`;
    }
    const langLabel = v.language ? v.language : 'English';
    return `${langLabel} ${genderStr}`;
  };

  return (
    <section className="panel voice-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">02 / Voice & Delivery</p>
          <h2>Voice Selection</h2>
        </div>
      </div>

      <div className="voice-dropdown-group">
        <label className="field-label" htmlFor="voice-select">
          Voice
        </label>
        <div className="select-preview-row">
          <div className="select-wrapper">
            <select
              id="voice-select"
              className="styled-select voice-dropdown-select"
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
            >
              {activeVoicesList.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatVoiceLabel(v)}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>

          <button
            type="button"
            className="voice-preview-btn dropdown-preview-btn"
            onClick={previewVoice}
            title={`Preview ${currentVoice?.gender || 'voice'}`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span>Preview</span>
          </button>
        </div>
      </div>

      <div className="delivery-controls">
        <div className="slider-box">
          <div className="slider-header">
            <label htmlFor="speed-slider">Speaking Speed (Rate)</label>
            <span className="slider-val">{speed.toFixed(1)}x</span>
          </div>
          <div className="slider-row">
            <span>0.5x</span>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>2.0x</span>
          </div>
        </div>

        <div className="slider-box">
          <div className="slider-header">
            <label htmlFor="pitch-slider">Voice Pitch</label>
            <span className="slider-val">{pitch.toFixed(1)}x</span>
          </div>
          <div className="slider-row">
            <span>Low</span>
            <input
              id="pitch-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
            />
            <span>High</span>
          </div>
        </div>
      </div>
    </section>
  );
}
