/**
 * Text-to-Speech utility for Chinese character pronunciation.
 * Uses the browser's built-in SpeechSynthesis API with zh-CN voice.
 */

let zhVoice: SpeechSynthesisVoice | null = null;

function findChineseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'zh-CN') ??
    voices.find((v) => v.lang.startsWith('zh')) ??
    undefined
  );
}

// Voices load asynchronously in most browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    zhVoice = findChineseVoice() ?? null;
  };
  // Try immediately too (Firefox loads sync)
  zhVoice = findChineseVoice() ?? null;
}

export function speakChinese(text: string, onError?: (msg: string) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Text-to-speech is not supported in this browser.');
    return;
  }

  // Cancel any in-progress speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.8;
  utterance.pitch = 1;

  if (!zhVoice) zhVoice = findChineseVoice() ?? null;
  if (zhVoice) {
    utterance.voice = zhVoice;
  } else {
    // No Chinese voice found — browser will fall back to default voice.
    // This is intentional: still attempt speech rather than silently failing.
  }

  utterance.onerror = (event) => {
    // 'interrupted' fires when cancel() is called before the utterance ends — not a real error.
    if (event.error === 'interrupted' || event.error === 'canceled') return;
    onError?.(`Speech synthesis error: ${event.error}`);
  };

  speechSynthesis.speak(utterance);
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
