/**
 * Text-to-Speech utility for Chinese character pronunciation.
 * Uses the browser's built-in SpeechSynthesis API with zh-CN voice.
 */

let zhVoice: SpeechSynthesisVoice | null = null;

function findChineseVoice(): SpeechSynthesisVoice | undefined {
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

export function speakChinese(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Cancel any in-progress speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.8;
  utterance.pitch = 1;

  if (!zhVoice) zhVoice = findChineseVoice() ?? null;
  if (zhVoice) utterance.voice = zhVoice;

  speechSynthesis.speak(utterance);
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
