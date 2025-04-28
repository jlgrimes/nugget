import { useState } from 'react';
import CartoonEyes from './CartoonEyes';
import './App.css';
import VoiceChat from './VoiceChat';
import { EyeState } from './Eye';

function App() {
  const [eyeState, setEyeState] = useState<EyeState>('idle');

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <CartoonEyes eyeState={eyeState} />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <VoiceChat onStateChange={setEyeState} />
      </div>
    </div>
  );
}

export default App;
