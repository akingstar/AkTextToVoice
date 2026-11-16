import { useState } from 'react'
import './App.css'

const studios = [
  { id: 'tts', icon: '◖', name: 'Text to Speech', detail: 'Convert your words into natural speech.' },
  { id: 'clone', icon: '◉', name: 'Voice Cloning', detail: 'Build a voice model using authorized recordings.' },
  { id: 'sing', icon: '♫', name: 'AI Singing', detail: 'Prepare lyrics and voice for singing.' },
]

export default function App() {
  const [mode, setMode] = useState('tts')
  const [text, setText] = useState('')
  const [status, setStatus] = useState('Select a studio to get started.')

  const selected = studios.find(x => x.id === mode)

  function launch() {
    setStatus(
      mode === 'tts' ? 'TTS engine integration is coming in Stage 2.' :
      mode === 'clone' ? 'Voice cloning integration is coming in Stage 3.' :
      'AI singing integration is coming in Stage 4.'
    )
  }

  return (
    <main className="page">
      <nav>
        <a className="logo" href="./">AK<span>TEXT</span>VOICE</a>
        <span className="free">FREE AUDIO STUDIO</span>
      </nav>

      <header className="hero">
        <div className="tag">YOUR CREATIVE AUDIO WORKSPACE</div>
        <h1>Give your words<br/><span>a voice.</span></h1>
        <p>Text-to-speech, voice cloning and AI singing in one creative studio.</p>
        <div className="chips"><span>Text to Voice</span><span>Voice Studio</span><span>AI Singing</span></div>
      </header>

      <section className="studio">
        <div className="heading">
          <div><div className="tag">THE WORKSPACE</div><h2>Choose your studio</h2></div>
          <span className="stage">STAGE 1 / 4</span>
        </div>

        <div className="choices">
          {studios.map(s => (
            <button key={s.id} className={`choice ${mode === s.id ? 'active' : ''}`}
              onClick={() => { setMode(s.id); setStatus('Ready when you are.') }}>
              <span className="symbol">{s.icon}</span>
              <strong>{s.name}</strong>
              <small>{s.detail}</small>
            </button>
          ))}
        </div>

        <div className="editor">
          <label>{mode === 'tts' ? 'YOUR TEXT' : mode === 'clone' ? 'VOICE PROJECT NOTES' : 'YOUR SONG LYRICS'}</label>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={mode === 'tts' ? 'Type or paste your text here...' : mode === 'clone' ? 'Describe your authorized voice project...' : 'Write or paste your lyrics here...'}/>
          <div className="controls">
            <span>{text.length} characters</span>
            <button className="launch" onClick={launch}>Open {selected.name} ↗</button>
          </div>
          <p className="status">{status}</p>
        </div>
      </section>

      <footer><span>AK TEXT TO VOICE</span><span>Free tools · Open source · Creative audio</span></footer>
    </main>
  )
}
