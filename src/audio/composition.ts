// Original eight-bar loop, composed for Misión Gati. No sampled recordings.
export const BPM = 84;
export const BEAT = 60 / BPM;
export type Instrument =
  | "bass"
  | "mallet"
  | "pad"
  | "kick"
  | "conga"
  | "shaker";
export interface MusicEvent {
  beat: number;
  note: number;
  duration: number;
  gain: number;
  instrument: Instrument;
}
export function musicBar(bar: number): MusicEvent[] {
  const chords = [
    [45, 52, 55, 59],
    [41, 48, 52, 57],
    [48, 55, 59, 62],
    [43, 50, 55, 59],
  ];
  const chord = chords[Math.floor((bar % 8) / 2)];
  const notes = [64, 67, 69, 67, 62, 64, 60, 62];
  const events: MusicEvent[] = [];
  const add = (
    instrument: Instrument,
    beat: number,
    note: number,
    duration: number,
    gain: number,
  ) => events.push({ instrument, beat, note, duration, gain });
  add("bass", 0, chord[0] - 12, 1.4, 0.2);
  add("bass", 2.5, chord[0] - 12, 0.8, 0.14);
  chord.slice(1).forEach((note) => add("pad", 0, note, 3.7, 0.025));
  add("mallet", 0.5, notes[bar % 8], 0.8, 0.11);
  add("mallet", 2, notes[(bar + 2) % 8], 0.65, 0.08);
  if (bar % 2) add("mallet", 3.25, notes[(bar + 3) % 8], 0.5, 0.065);
  add("kick", 0, 0, 0.28, 0.2);
  add("kick", 2, 0, 0.23, 0.12);
  add("conga", 1.5, 0, 0.18, 0.09);
  add("conga", 3, 0, 0.22, 0.13);
  add("conga", 3.75, 0, 0.15, 0.06);
  for (let i = 0; i < 8; i++)
    add("shaker", i * 0.5 + 0.03 * (i % 2), 0, 0.065, i % 2 ? 0.022 : 0.014);
  return events;
}
