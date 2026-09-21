import React, { useEffect, useState } from 'react';

import Header from './components/Header';
import TextInput from './components/TextInput';
import LanguageSelector from './components/LanguageSelector';
import VoiceSelector from './components/VoiceSelector';
import AudioPlayer from './components/AudioPlayer';
import ErrorMessage from './components/ErrorMessage';

import './App.css';

const DEFAULT_VOICES = [
  { id: 'en-US-JennyNeural', name: 'Jenny', language: 'English (US)', languageCode: 'en-US', gender: 'Female', style: 'Warm & natural', sampleText: 'Welcome to Echo, a calmer way to turn text into voice.' },
  { id: 'en-US-GuyNeural', name: 'Guy', language: 'English (US)', languageCode: 'en-US', gender: 'Male', style: 'Professional & clear', sampleText: 'Hello, this is a clear and professional male voice delivery.' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', language: 'English (UK)', languageCode: 'en-GB', gender: 'Male', style: 'Assured & articulate', sampleText: 'Greetings, this is an articulate British voice sample.' },
  { id: 'hi-IN-SwaraNeural', name: 'Swara', language: 'Hindi', languageCode: 'hi-IN', gender: 'Female', style: 'Expressive & warm', sampleText: 'नमस्ते, Echo में आपका स्वागत है।' },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur', language: 'Hindi', languageCode: 'hi-IN', gender: 'Male', style: 'Friendly & deep', sampleText: 'नमस्ते, आपकी आवाज़ तैयार है।' },
  { id: 'gu-IN-DhwaniNeural', name: 'Dhwani', language: 'Gujarati', languageCode: 'gu-IN', gender: 'Female', style: 'Clear & calm', sampleText: 'નમસ્તે, Echo ટેક્સ્ટ ટુ સ્પીચમાં આપનું સ્વાગત છે.' },
  { id: 'mr-IN-AarohiNeural', name: 'Aarohi', language: 'Marathi', languageCode: 'mr-IN', gender: 'Female', style: 'Melodic & distinct', sampleText: 'नमस्कार, Echo मध्ये आपले स्वागत आहे.' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira', language: 'Spanish', languageCode: 'es-ES', gender: 'Female', style: 'Smooth & fluid', sampleText: 'Hola, bienvenido al estudio de voz Echo.' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise', language: 'French', languageCode: 'fr-FR', gender: 'Female', style: 'Bright & graceful', sampleText: 'Bonjour, bienvenue sur le studio Echo.' },
  { id: 'de-DE-KatjaNeural', name: 'Katja', language: 'German', languageCode: 'de-DE', gender: 'Female', style: 'Energetic & clear', sampleText: 'Guten Tag, willkommen im Echo Studio.' }
];

const LANGUAGE_SAMPLES = {
  'hi-IN': 'नमस्ते! Echo में आपका स्वागत है। अपनी पसंदीदा आवाज़ चुनें।',
  'gu-IN': 'નમસ્તે, Echo ટેક્સ્ટ ટુ સ્પીચમાં આપનું સ્વાગત છે. તમારી પસંદગીની વાચન અવાજ સાંભળો.',
  'mr-IN': 'नमस्कार, Echo मध्ये आपले स्वागत आहे. तुमची आवडती भाषा आणि आवाजाची निवड करा.',
  'es-ES': 'Hola, bienvenido al estudio de síntesis de voz natural Echo.',
  'fr-FR': 'Bonjour, bienvenue sur le studio de synthèse vocale Echo.',
  'de-DE': 'Guten Tag, willkommen im Echo Sprachstudio.',
  'en-US': 'Welcome to Echo, a calmer way to turn your words into natural-sounding speech.',
  'en-GB': 'Greetings, welcome to the natural speech synthesis studio.',
  'ALL': 'Welcome to Echo, a calmer way to turn your words into natural-sounding speech.'
};

const BACKEND_URL = 'http://localhost:8080';

export default function App() {
  const [text, setText] = useState('Welcome to Echo, a calmer way to turn your words into natural-sounding speech.');
  const [selectedLang, setSelectedLang] = useState('ALL');
  const [voices, setVoices] = useState(DEFAULT_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICES[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState(null);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  useEffect(() => {
    checkHealthAndFetchVoices();
    const interval = setInterval(checkHealthAndFetchVoices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);

    if (LANGUAGE_SAMPLES[langCode]) {
      setText(LANGUAGE_SAMPLES[langCode]);
    }

    const langVoices = voices.filter((v) => {
      if (langCode === 'ALL') return true;
      return v.languageCode === langCode || v.language === langCode || (v.language && v.language.includes(langCode));
    });

    if (langVoices.length > 0) {
      setSelectedVoiceId(langVoices[0].id);
    }
  };

  const checkHealthAndFetchVoices = async () => {
    try {
      const healthRes = await fetch(`${BACKEND_URL}/api/health`);
      if (healthRes.ok) {
        setIsBackendOnline(true);
        const voicesRes = await fetch(`${BACKEND_URL}/api/voices`);
        if (voicesRes.ok) {
          const data = await voicesRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setVoices(data);
          }
        }
      } else {
        setIsBackendOnline(false);
      }
    } catch (e) {
      setIsBackendOnline(false);
    } finally {
      setCheckingBackend(false);
    }
  };

  const activeVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError({ title: 'Validation Error', message: 'Text input cannot be empty. Please enter your script.' });
      return;
    }

    if (text.length > 5000) {
      setError({ title: 'Validation Error', message: 'Text length exceeds maximum 5,000 character limit.' });
      return;
    }

    setIsGenerating(true);

    if (isBackendOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text.trim(),
            language: activeVoice.languageCode || activeVoice.language || 'en-US',
            voice: activeVoice.id,
            speed: speed,
            pitch: pitch,
            format: 'wav'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const fullAudioUrl = `${BACKEND_URL}${data.audioUrl}`;
          setAudioUrl(fullAudioUrl);
          setDurationSeconds(data.durationSeconds || Math.max(2, Math.round(text.split(/\s+/).length / 2.5)));
        } else {
          const msg = data.message || (data.validationErrors ? Object.values(data.validationErrors).join(', ') : 'Failed to generate speech');
          setError({ title: 'Backend Error', message: msg });
        }
      } catch (err) {
        setError({
          title: 'Network Error',
          message: 'Unable to connect to Spring Boot backend. Falling back to browser speech synthesis.'
        });
        fallbackWebSpeech();
      } finally {
        setIsGenerating(false);
      }
    } else {
      fallbackWebSpeech();
    }
  };

  const fallbackWebSpeech = () => {
    if (!('speechSynthesis' in window)) {
      setError({ title: 'Not Supported', message: 'Browser Speech Synthesis is not supported in this browser.' });
      setIsGenerating(false);
      return;
    }

    window.setTimeout(() => {
      setAudioUrl('browser-speech');
      setDurationSeconds(Math.max(2, Math.round(text.split(/\s+/).length / 2.5)));
      setIsGenerating(false);
    }, 400);
  };

  return (
    <main className="app-shell">
      <Header isBackendOnline={isBackendOnline} checkingBackend={checkingBackend} />

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      <form className="studio-layout" onSubmit={handleGenerate}>
        <div className="main-column">
          <TextInput text={text} setText={setText} maxCharacters={5000} />

          <AudioPlayer
            audioUrl={audioUrl}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            text={text}
            activeVoice={activeVoice}
            speed={speed}
            pitch={pitch}
            durationSeconds={durationSeconds}
          />
        </div>

        <aside className="sidebar-column">
          <LanguageSelector selectedLang={selectedLang} setSelectedLang={handleLanguageChange} />

          <VoiceSelector
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            setSelectedVoiceId={setSelectedVoiceId}
            selectedLang={selectedLang}
            speed={speed}
            setSpeed={setSpeed}
            pitch={pitch}
            setPitch={setPitch}
          />
        </aside>
      </form>

      <footer className="app-footer">
        <span>Echo AI Studio &copy; {new Date().getFullYear()} — Production Build</span>
        <span>Powered by Java Spring Boot REST API &amp; React</span>
      </footer>
    </main>
  );
}
