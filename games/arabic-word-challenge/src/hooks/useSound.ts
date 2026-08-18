import { useCallback, useMemo, useRef } from "react";

export type SoundApi = {
  correct: () => void;
  wrong: () => void;
  buzz: () => void;
  tick: () => void;
  reveal: () => void;
  finish: () => void;
};

/** مؤثرات صوتية عبر Web Audio API مباشرة، بلا ملفات خارجية. */
export function useSound(enabled: boolean): SoundApi {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    return ctxRef.current;
  };

  const tone = useCallback(
    (freq: number, dur: number, type: OscillatorType = "sine", vol = 0.16, delay = 0) => {
      if (!enabled) return;
      const c = ctx();
      if (!c) return;
      if (c.state === "suspended") c.resume();
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },
    [enabled]
  );

  return useMemo(
    () => ({
      correct: () => {
        tone(660, 0.16, "triangle", 0.18);
        tone(880, 0.16, "triangle", 0.18, 0.13);
        tone(1180, 0.3, "triangle", 0.16, 0.26);
      },
      wrong: () => {
        tone(180, 0.28, "sawtooth", 0.13);
        tone(120, 0.34, "sawtooth", 0.12, 0.1);
      },
      buzz: () => {
        tone(520, 0.09, "square", 0.14);
        tone(760, 0.12, "square", 0.13, 0.08);
      },
      tick: () => tone(1000, 0.05, "sine", 0.07),
      reveal: () => tone(520, 0.07, "sine", 0.07),
      finish: () => {
        [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.4, "triangle", 0.16, i * 0.15));
      },
    }),
    [tone]
  );
}
