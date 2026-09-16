import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const MAX_CHARACTERS = 5000
const voices = [
  { id: 'en-US-JennyNeural', name: 'Jenny', language: 'English (US)', languageCode: 'en-US', style: 'Warm & natural', tone: 'coral' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', language: 'English (UK)', languageCode: 'en-GB', style: 'Clear & assured', tone: 'blue' },
  { id: 'hi-IN-SwaraNeural', name: 'Swara', language: 'Hindi', languageCode: 'hi-IN', style: 'Expressive', tone: 'gold' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise', language: 'French', languageCode: 'fr-FR', style: 'Bright & smooth', tone: 'green' },
]
const starterText = 'Welcome to Echo, a calmer way to turn your words into sound.'

function App() {
  const [text, setText] = useState(starterText)
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id)
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [notice, setNotice] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const utteranceRef = useRef(null)
  const activeVoice = voices.find((voice) => voice.id === selectedVoice) ?? voices[0]
  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text])

  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  function handleGenerate(event) {
    event.preventDefault()
    setNotice('')
    if (!text.trim()) return setNotice('Add some text before generating speech.')
    if (text.length > MAX_CHARACTERS) return setNotice(`Keep your script under ${MAX_CHARACTERS.toLocaleString()} characters.`)
    setIsGenerating(true)
    window.setTimeout(() => {
      setAudioUrl('browser-speech')
      setIsGenerating(false)
      setNotice('Ready to listen. Your browser is providing the preview voice.')
    }, 550)
  }

  function handlePlay() {
    if (!text.trim()) return setNotice('Add some text before playing speech.')
    if (!window.speechSynthesis) return setNotice('Speech playback is not supported in this browser.')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = activeVoice.languageCode
    utterance.rate = speed
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => { setIsPlaying(false); setNotice('The browser could not play this preview. Try again.') }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function handleStop() { window.speechSynthesis?.cancel(); setIsPlaying(false) }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'echo-script.txt'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Script downloaded. Connect the backend to export MP3 or WAV audio.')
  }

  return (
    <main className="app-shell">
      <nav className="topbar"><a className="brand" href="/" aria-label="Echo home"><span className="brand-mark">e</span><span>echo</span></a><div className="topbar-meta"><span className="status-dot" /> Browser preview mode <span className="divider" /> <span className="avatar">AK</span></div></nav>
      <section className="intro"><div><p className="eyebrow">Your voice, on demand</p><h1>Give your words<br /><em>a little air.</em></h1><p className="intro-copy">Turn text into natural-sounding speech in seconds. Choose a voice, shape the delivery, and press play.</p></div><div className="waveform" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ '--height': `${18 + ((index * 17) % 55)}%` }} />)}</div></section>
      <form className="studio-grid" onSubmit={handleGenerate}><section className="script-panel panel"><div className="panel-heading"><div><p className="section-kicker">01 / Script</p><h2>What should we say?</h2></div><span className="field-hint">Plain text</span></div><textarea value={text} maxLength={MAX_CHARACTERS} onChange={(event) => setText(event.target.value)} placeholder="Paste or write your script here..." aria-label="Text to convert to speech" /><div className="textarea-footer"><span>{wordCount} words</span><span className={text.length > MAX_CHARACTERS * .9 ? 'near-limit' : ''}>{text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters</span></div></section>
        <aside className="controls-column"><section className="panel voice-panel"><div className="panel-heading"><div><p className="section-kicker">02 / Voice</p><h2>Find your tone</h2></div><span className="voice-count">{voices.length} voices</span></div><div className="voice-list">{voices.map((voice) => <button className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`} type="button" key={voice.id} onClick={() => setSelectedVoice(voice.id)}><span className={`voice-orb ${voice.tone}`}>{voice.name[0]}</span><span className="voice-info"><strong>{voice.name}</strong><small>{voice.language} · {voice.style}</small></span><span className="radio" /></button>)}</div></section><section className="panel delivery-panel"><div className="panel-heading"><div><p className="section-kicker">03 / Delivery</p><h2>Shape the read</h2></div><span className="speed-value">{speed.toFixed(1)}x</span></div><label className="range-label" htmlFor="speed"><span>Slower</span><span>Faster</span></label><input id="speed" type="range" min="0.6" max="1.4" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></section><button className="generate-button" type="submit" disabled={isGenerating}>{isGenerating ? <><span className="spinner" /> Preparing preview...</> : <>Generate speech <span>↗</span></>}</button>{notice && <p className="notice" role="status">{notice}</p>}</aside></form>
      <section className={`output-panel panel ${audioUrl ? 'ready' : ''}`}><div className="output-title"><span className="play-icon">{isPlaying ? 'Ⅱ' : '▶'}</span><div><p className="section-kicker">04 / Output</p><h2>{audioUrl ? 'Your speech is ready' : 'Your generated speech will appear here'}</h2></div></div>{audioUrl && <div className="player-row"><button className="play-button" type="button" onClick={isPlaying ? handleStop : handlePlay} aria-label={isPlaying ? 'Stop speech' : 'Play speech'}>{isPlaying ? 'Ⅱ' : '▶'}</button><div className="player-track"><div className={`track-progress ${isPlaying ? 'animating' : ''}`} /><div className="track-lines" /></div><span className="duration">{isPlaying ? 'Playing' : '0:00'}</span><button className="download-button" type="button" onClick={handleDownload} aria-label="Download script">↓</button></div>}{!audioUrl && <div className="empty-wave">{Array.from({ length: 64 }, (_, index) => <i key={index} style={{ '--height': `${12 + ((index * 23) % 40)}%` }} />)}</div>}</section>
      <footer><span>Echo TTS Studio</span><span>Built for focus, designed for listening.</span></footer>
    </main>
  )
}

export default App
