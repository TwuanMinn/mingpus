import { describe, it, expect, beforeEach } from 'vitest';
import { usePracticeStore } from '@/store/usePracticeStore';
import { useSettingsStore } from '@/store/useSettingsStore';

// ─── Practice Store ───────────────────────────────────────────────────────────

describe('usePracticeStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePracticeStore.setState({
      cardsRemaining: 0,
      score: 0,
      streak: 0,
      mastered: 0,
      reviewed: 0,
    });
  });

  it('starts with all values at zero', () => {
    const state = usePracticeStore.getState();
    expect(state.cardsRemaining).toBe(0);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.mastered).toBe(0);
    expect(state.reviewed).toBe(0);
  });

  it('setCardsRemaining updates the count', () => {
    usePracticeStore.getState().setCardsRemaining(25);
    expect(usePracticeStore.getState().cardsRemaining).toBe(25);
  });

  it('incrementScore adds base XP with streak multiplier', () => {
    usePracticeStore.getState().incrementScore();
    const score = usePracticeStore.getState().score;
    // base = 10 * (1 + 0 * 0.1) = 10
    expect(score).toBe(10);
  });

  it('incrementScore applies streak multiplier', () => {
    // Set streak to 5
    for (let i = 0; i < 5; i++) {
      usePracticeStore.getState().incrementStreak();
    }
    usePracticeStore.getState().incrementScore();
    const score = usePracticeStore.getState().score;
    // base = 10 * (1 + 5 * 0.1) = 10 * 1.5 = 15
    expect(score).toBe(15);
  });

  it('incrementStreak increases streak by 1', () => {
    usePracticeStore.getState().incrementStreak();
    expect(usePracticeStore.getState().streak).toBe(1);
    usePracticeStore.getState().incrementStreak();
    expect(usePracticeStore.getState().streak).toBe(2);
  });

  it('resetStreak sets streak to 0', () => {
    usePracticeStore.getState().incrementStreak();
    usePracticeStore.getState().incrementStreak();
    usePracticeStore.getState().resetStreak();
    expect(usePracticeStore.getState().streak).toBe(0);
  });

  it('recordMastered increments mastered count', () => {
    usePracticeStore.getState().recordMastered();
    expect(usePracticeStore.getState().mastered).toBe(1);
    usePracticeStore.getState().recordMastered();
    expect(usePracticeStore.getState().mastered).toBe(2);
  });

  it('recordReviewed increments reviewed count', () => {
    usePracticeStore.getState().recordReviewed();
    expect(usePracticeStore.getState().reviewed).toBe(1);
  });

  it('resetSession resets all values to zero', () => {
    usePracticeStore.getState().setCardsRemaining(10);
    usePracticeStore.getState().incrementScore();
    usePracticeStore.getState().incrementStreak();
    usePracticeStore.getState().recordMastered();
    usePracticeStore.getState().recordReviewed();

    usePracticeStore.getState().resetSession();

    const state = usePracticeStore.getState();
    expect(state.cardsRemaining).toBe(0);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.mastered).toBe(0);
    expect(state.reviewed).toBe(0);
  });

  it('simulates a full practice session lifecycle', () => {
    const store = usePracticeStore.getState();

    // Start session
    store.setCardsRemaining(5);

    // Review 3 correct in a row
    for (let i = 0; i < 3; i++) {
      usePracticeStore.getState().incrementStreak();
      usePracticeStore.getState().incrementScore();
      usePracticeStore.getState().recordReviewed();
      usePracticeStore.getState().setCardsRemaining(
        usePracticeStore.getState().cardsRemaining - 1,
      );
    }

    expect(usePracticeStore.getState().reviewed).toBe(3);
    expect(usePracticeStore.getState().streak).toBe(3);
    expect(usePracticeStore.getState().cardsRemaining).toBe(2);
    expect(usePracticeStore.getState().score).toBeGreaterThan(0);

    // Miss one
    usePracticeStore.getState().resetStreak();
    usePracticeStore.getState().recordReviewed();
    expect(usePracticeStore.getState().streak).toBe(0);
    expect(usePracticeStore.getState().reviewed).toBe(4);
  });
});

// ─── Settings Store ───────────────────────────────────────────────────────────

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      autoPlayTTS: false,
      speechRate: 'normal',
      dailyGoal: 20,
      showPinyinByDefault: true,
      enableCardAnimations: true,
      fontSize: 'medium',
    });
  });

  it('starts with correct defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.autoPlayTTS).toBe(false);
    expect(state.speechRate).toBe('normal');
    expect(state.dailyGoal).toBe(20);
    expect(state.showPinyinByDefault).toBe(true);
    expect(state.enableCardAnimations).toBe(true);
    expect(state.fontSize).toBe('medium');
  });

  it('setAutoPlayTTS toggles TTS setting', () => {
    useSettingsStore.getState().setAutoPlayTTS(true);
    expect(useSettingsStore.getState().autoPlayTTS).toBe(true);
    useSettingsStore.getState().setAutoPlayTTS(false);
    expect(useSettingsStore.getState().autoPlayTTS).toBe(false);
  });

  it('setSpeechRate updates speech rate', () => {
    useSettingsStore.getState().setSpeechRate('slow');
    expect(useSettingsStore.getState().speechRate).toBe('slow');
    useSettingsStore.getState().setSpeechRate('fast');
    expect(useSettingsStore.getState().speechRate).toBe('fast');
  });

  it('setDailyGoal updates the study goal', () => {
    useSettingsStore.getState().setDailyGoal(50);
    expect(useSettingsStore.getState().dailyGoal).toBe(50);
    useSettingsStore.getState().setDailyGoal(100);
    expect(useSettingsStore.getState().dailyGoal).toBe(100);
  });

  it('setShowPinyinByDefault toggles pinyin visibility', () => {
    useSettingsStore.getState().setShowPinyinByDefault(false);
    expect(useSettingsStore.getState().showPinyinByDefault).toBe(false);
  });

  it('setEnableCardAnimations toggles animation setting', () => {
    useSettingsStore.getState().setEnableCardAnimations(false);
    expect(useSettingsStore.getState().enableCardAnimations).toBe(false);
  });

  it('setFontSize updates font size', () => {
    useSettingsStore.getState().setFontSize('large');
    expect(useSettingsStore.getState().fontSize).toBe('large');
    useSettingsStore.getState().setFontSize('small');
    expect(useSettingsStore.getState().fontSize).toBe('small');
  });
});
