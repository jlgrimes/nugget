import React, { useState, useRef, useEffect } from 'react';
import { EyeState } from './Eye';

interface VoiceChatProps {
  onStateChange: (state: EyeState) => void;
}

export default function VoiceChat({ onStateChange }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for model's voice
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioElementRef.current = audioEl;
    document.body.appendChild(audioEl);

    // Cleanup
    return () => {
      if (audioElementRef.current) {
        document.body.removeChild(audioElementRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const initWebRTC = async () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up to play remote audio from the model
      pc.ontrack = e => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track for microphone input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.addEventListener('message', e => {
        try {
          const event = JSON.parse(e.data);
          console.log('Received event:', event);

          if (event.type === 'transcript') {
            setTranscript(event.text);
            // Update eye state based on transcript activity
            onStateChange('talking-rest');
          }
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Start the session
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: await sdpResponse.text(),
      });
      await pc.setRemoteDescription(answer);

      setIsListening(true);
      onStateChange('listening');
      console.log('WebRTC connection established');
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('Failed to initialize voice chat. Please try again.');
    }
  };

  const startListening = async () => {
    if (!peerConnectionRef.current) {
      await initWebRTC();
    }
  };

  const stopListening = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      dataChannelRef.current = null;
      setIsListening(false);
      onStateChange('idle');
    }
  };

  return (
    <div className='p-4 h-screen flex flex-col'>
      <div className='flex gap-4 mb-4'>
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded ${
            isListening ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-gray-50 rounded'>
        {transcript && (
          <div className='p-3 mb-2 bg-blue-50 rounded'>
            <div className='font-bold'>Transcript:</div>
            <div>{transcript}</div>
          </div>
        )}
      </div>
    </div>
  );
}
