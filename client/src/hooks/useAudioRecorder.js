import { useState, useRef } from 'react';
import { transcribeAudio } from '../api/visits';

export function useAudioRecorder() {
  const [status, setStatus] = useState('idle'); // idle | recording | processing | done
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = handleStop;
    mediaRecorder.start();

    setStatus('recording');
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setStatus('processing');
  };

  const cancel = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    chunksRef.current = [];
    setStatus('idle');
    setTimer(0);
    setTranscript('');
    setSummary('');
  };

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    try {
      const data = await transcribeAudio(blob);
      setTranscript(data.transcript || '');
      setSummary(data.summary || '');
    } catch {
      setTranscript('Transcription failed. Please try again.');
      setSummary('');
    }
    setStatus('done');
  };

  return { status, transcript, summary, timer, start, stop, cancel };
}
