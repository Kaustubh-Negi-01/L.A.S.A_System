import { useCallback, useEffect, useRef } from 'react';

export type FeedbackSound = 'tap' | 'open' | 'confirm' | 'success' | 'error';

interface FeedbackOptions {
  enabled?: boolean;
  volume?: number;
}

type AudioContextConstructor = typeof AudioContext;

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextClass) return null;
  return AudioContextClass;
};

const soundProfiles: Record<FeedbackSound, { frequencies: number[]; duration: number; type: OscillatorType }> = {
  tap: { frequencies: [210], duration: 0.045, type: 'sine' },
  open: { frequencies: [250, 370], duration: 0.12, type: 'sine' },
  confirm: { frequencies: [280, 440], duration: 0.15, type: 'triangle' },
  success: { frequencies: [330, 495, 660], duration: 0.22, type: 'sine' },
  error: { frequencies: [190, 145], duration: 0.12, type: 'sawtooth' },
};

const playTone = (kind: FeedbackSound, volume: number) => {
  const AudioContextClass = getAudioContext();
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const profile = soundProfiles[kind];
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
  master.connect(context.destination);

  profile.frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * Math.min(0.045, profile.duration * 0.28);
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.015, start + profile.duration * 0.72);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(1, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + profile.duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + profile.duration + 0.02);
  });

  window.setTimeout(() => {
    void context.close();
  }, Math.ceil((profile.duration + 0.12) * 1000));
};

export const useInteractionFeedback = ({ enabled = true, volume = 0.035 }: FeedbackOptions = {}) => {
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);

  useEffect(() => {
    enabledRef.current = enabled;
    volumeRef.current = volume;
  }, [enabled, volume]);

  const playSound = useCallback((kind: FeedbackSound = 'tap') => {
    if (!enabledRef.current || localStorage.getItem('lasa-sound') === 'off') return;
    try {
      playTone(kind, volumeRef.current);
    } catch {
      // Audio is an enhancement; browser autoplay or device audio errors must not affect the app.
    }
  }, []);

  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'success' = 'light') => {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    if (localStorage.getItem('lasa-haptics') === 'off') return;
    const pattern = intensity === 'success' ? [12, 24, 18] : intensity === 'medium' ? [18] : [8];
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration is optional and unavailable in many browsers.
    }
  }, []);

  const pulse = useCallback((kind: FeedbackSound = 'tap', intensity: 'light' | 'medium' | 'success' = 'light') => {
    playSound(kind);
    triggerHaptic(intensity);
      window.dispatchEvent(new CustomEvent('lasa-feedback', { detail: { kind, intensity } }));
  }, [playSound, triggerHaptic]);

  useEffect(() => {
    const onSoundRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: FeedbackSound }>).detail;
      const kind = detail?.kind ?? 'tap';
      const intensity = kind === 'success' ? 'success' : kind === 'confirm' ? 'medium' : 'light';
      pulse(kind, intensity);
    };

    window.addEventListener('lasa-sound-request', onSoundRequest);
    return () => window.removeEventListener('lasa-sound-request', onSoundRequest);
  }, [pulse]);

  return { playSound, triggerHaptic, pulse };
};

export const installInteractionSoundBridge = () => {
  if (typeof window === 'undefined') return () => undefined;

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target.closest('button, a, [role="button"]') : null;
    if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') return;
    const label = `${target.textContent ?? ''} ${target.getAttribute('aria-label') ?? ''}`.toLowerCase();
    const explicitKind = target.getAttribute('data-feedback') as FeedbackSound | null;
    const kind: FeedbackSound = explicitKind ?? (label.includes('delete') || label.includes('error') ? 'error' : label.includes('complete') || label.includes('save') || label.includes('execute') || label.includes('dispatch') || label.includes('reset') ? 'confirm' : label.includes('open') || label.includes('new scan') || label.includes('quiz') || label.includes('explain') || label.includes('enter mode') || label.includes('switch mode') ? 'open' : 'tap');
    window.dispatchEvent(new CustomEvent('lasa-sound-request', { detail: { kind, clientX: event.clientX, clientY: event.clientY } }));
  };

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onPointerDown);
};
