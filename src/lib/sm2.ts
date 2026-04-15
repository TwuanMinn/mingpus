// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo 2 algorithm by Piotr Wozniak

export interface SM2Result {
  interval: number;     // days until next review
  repetition: number;   // number of consecutive correct answers
  efactor: number;      // easiness factor (stored as integer, divide by 1000)
}

export interface SM2Input {
  quality: number;      // 0-5 (0=complete blackout, 5=perfect response)
  repetition: number;
  interval: number;
  efactor: number;      // stored as integer (e.g. 2500 = 2.5)
}

export function sm2(input: SM2Input): SM2Result {
  const { quality, repetition, interval, efactor } = input;
  const ef = efactor / 1000; // convert back to float

  let newInterval: number;
  let newRepetition: number;
  let newEfactor: number;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * ef);
    }
    newRepetition = repetition + 1;
  } else {
    // Incorrect response — reset
    newInterval = 1;
    newRepetition = 0;
  }

  // Update easiness factor
  newEfactor = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEfactor < 1.3) newEfactor = 1.3;

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: Math.round(newEfactor * 1000),
  };
}

export function getDueDate(intervalDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date;
}

export function qualityFromResult(correct: boolean, timeMs?: number): number {
  if (!correct) return 1; // incorrect but remembered after seeing answer
  if (timeMs && timeMs > 10000) return 3; // correct but slow
  if (timeMs && timeMs > 5000) return 4;  // correct with hesitation
  return 5; // perfect, instant recall
}
