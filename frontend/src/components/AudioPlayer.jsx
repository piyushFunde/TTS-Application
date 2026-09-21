import React, { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({
  audioUrl,
  isGenerating,
  onGenerate,
  text,
  activeVoice,
  speed,
  pitch,
  durationSeconds
}) {
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [systemVoices, setSystemVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        setSystemVoices(available);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current && audioUrl && audioUrl.startsWith('http')) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    if (durationSeconds) {
      setDuration(durationSeconds);
    }
  }, [durationSeconds]);

  useEffect(() => {
    let interval;
    if (isPlaying && (!audioUrl || !audioUrl.startsWith('http'))) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) return duration;
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, audioUrl]);

  const speakCleanText = () => {
    if (!('speechSynthesis' in window)) return false;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed || 1.0;
    utterance.pitch = pitch || 1.0;
    utterance.volume = isMuted ? 0 : volume;

    const targetLang = activeVoice?.languageCode || 'en-US';
    utterance.lang = targetLang;

    const voicesList = systemVoices.length > 0 ? systemVoices : window.speechSynthesis.getVoices();
    const langPrefix = targetLang.split('-')[0].toLowerCase();

    const exactMatch = voicesList.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
    const langMatch = voicesList.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

    if (exactMatch) {
      utterance.voice = exactMatch;
    } else if (langMatch) {
      utterance.voice = langMatch;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentTime(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const togglePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioUrl && audioUrl.startsWith('http')) {
        if (audioRef.current) {
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      } else {
        speakCleanText();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioUrl && audioUrl.startsWith('http')) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && audioUrl && audioUrl.startsWith('http')) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if ('speechSynthesis' in window && utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : val;
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if ('speechSynthesis' in window && utteranceRef.current) {
      utteranceRef.current.volume = nextMute ? 0 : volume;
    }
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const handleDownload = () => {
    if (!text.trim()) return;

    if (audioUrl && audioUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = audioUrl;
      const ext = audioUrl.endsWith('.mp3') ? 'mp3' : 'wav';
      link.download = `speech-${activeVoice?.gender || 'audio'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `script-${activeVoice?.gender || 'speech'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeVoiceTitle = activeVoice
    ? `${activeVoice.language} (${activeVoice.gender || 'Voice'})`
    : 'Selected Voice';

  return (
    <section className={`panel output-panel ${audioUrl ? 'ready' : ''}`}>
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
      />

      <div className="output-header">
        <div className="output-title">
          <div className={`status-icon-ring ${isPlaying ? 'playing' : ''}`}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </div>
          <div>
            <h2>{audioUrl ? `Audio Ready — ${activeVoiceTitle}` : 'Generated Audio Player'}</h2>
            <span className="panel-subtitle">Synthesize script into high quality audio output</span>
          </div>
        </div>

        <button
          className="generate-main-button"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !text.trim()}
        >
          {isGenerating ? (
            <>
              <span className="spinner" /> Synthesizing...
            </>
          ) : (
            <>
              <span>Generate Speech</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>
      </div>

      {audioUrl ? (
        <div className="player-wrapper">
          <div className="player-controls-row">
            <button
              className="player-play-btn"
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause Speech' : 'Play Speech'}
              title={isPlaying ? 'Pause' : 'Play audio'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>

            <div className="scrubber-container">
              <span className="time-display">{formatTime(currentTime)}</span>
              <input
                className="scrubber-slider"
                type="range"
                min="0"
                max={duration || 10}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
              />
              <span className="time-display">{formatTime(duration)}</span>
            </div>

            <div className="volume-container">
              <button className="icon-btn" type="button" onClick={toggleMute} title="Mute/Unmute">
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>
              <input
                className="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </div>

            <button
              className="download-action-btn"
              type="button"
              onClick={handleDownload}
              title="Download audio file"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Download Audio</span>
            </button>
          </div>

          <div className="audio-visualizer">
            {Array.from({ length: 48 }).map((_, i) => (
              <span
                key={i}
                className={`bar ${isPlaying ? 'animating' : ''}`}
                style={{
                  animationDelay: `${(i % 12) * 0.1}s`,
                  height: isPlaying ? `${20 + ((i * 17) % 75)}%` : '15%'
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-player-state">
          <div className="placeholder-bars">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} style={{ height: `${10 + ((i * 13) % 40)}%` }} />
            ))}
          </div>
          <p className="placeholder-text">
            Choose your language & voice, type a script, and click <strong>Generate Speech</strong> to synthesize audio.
          </p>
        </div>
      )}
    </section>
  );
}
