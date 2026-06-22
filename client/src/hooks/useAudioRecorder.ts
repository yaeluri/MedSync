import { useState, useRef } from 'react';
import { transcribeAudio, VisitSummaryObject } from '../api/visits';

type Status = 'idle' | 'recording' | 'processing' | 'done';

export function useAudioRecorder() {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<VisitSummaryObject | null>(null);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('processing');
  };

  const cancel = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    chunksRef.current = [];
    setStatus('idle');
    setTimer(0);
    setTranscript('');
    setSummary(null);
  };

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    try {
      const data = await transcribeAudio(blob);
      setTranscript(data.transcript || '');
      // Guard: server may return a plain string on older builds
      const s = data.summary;
      setSummary(s && typeof s === 'object' ? s : null);
    } catch {
      setTranscript('');
      setSummary(null);
    }
    setStatus('done');
  };

  return { status, transcript, summary, timer, start, stop, cancel };
}
