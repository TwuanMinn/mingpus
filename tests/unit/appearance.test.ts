import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyAppearanceToDom, type AppearanceState } from '@/store/useAppearanceStore';

describe('applyAppearanceToDom', () => {
  let html: HTMLHtmlElement;

  beforeEach(() => {
    html = document.documentElement;
    // Clear any leftover from previous tests
    html.classList.remove('dark', 'light');
    html.removeAttribute('data-theme');
    html.removeAttribute('data-fontsize');
    html.style.removeProperty('--color-primary');
    html.style.removeProperty('--color-on-primary');
  });

  const makeState = (
    overrides: Partial<Pick<AppearanceState, 'theme' | 'fontSize' | 'accentColor'>> = {},
  ) => ({
    theme: 'dark-cosmos' as const,
    fontSize: 'medium' as const,
    accentColor: '#7C6FF7',
    ...overrides,
  });

  // ── Dark / Light class toggling ─────────────────────────────────────────

  it('adds "dark" class for dark-cosmos theme', () => {
    applyAppearanceToDom(makeState({ theme: 'dark-cosmos' }));
    expect(html.classList.contains('dark')).toBe(true);
    expect(html.classList.contains('light')).toBe(false);
  });

  it('adds "light" class for light-jade theme', () => {
    applyAppearanceToDom(makeState({ theme: 'light-jade' }));
    expect(html.classList.contains('light')).toBe(true);
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('adds "light" class for light-classic theme', () => {
    applyAppearanceToDom(makeState({ theme: 'light-classic' }));
    expect(html.classList.contains('light')).toBe(true);
  });

  it('adds "dark" class for ink-scroll theme', () => {
    applyAppearanceToDom(makeState({ theme: 'ink-scroll' }));
    expect(html.classList.contains('dark')).toBe(true);
  });

  it('adds "dark" class for sunset theme', () => {
    applyAppearanceToDom(makeState({ theme: 'sunset' }));
    expect(html.classList.contains('dark')).toBe(true);
  });

  // ── data-theme attribute ────────────────────────────────────────────────

  it('does NOT set data-theme for dark-cosmos (default)', () => {
    applyAppearanceToDom(makeState({ theme: 'dark-cosmos' }));
    expect(html.hasAttribute('data-theme')).toBe(false);
  });

  it('sets data-theme for non-default themes', () => {
    applyAppearanceToDom(makeState({ theme: 'light-jade' }));
    expect(html.getAttribute('data-theme')).toBe('light-jade');
  });

  it('sets data-theme for ink-scroll', () => {
    applyAppearanceToDom(makeState({ theme: 'ink-scroll' }));
    expect(html.getAttribute('data-theme')).toBe('ink-scroll');
  });

  it('sets data-theme for sunset', () => {
    applyAppearanceToDom(makeState({ theme: 'sunset' }));
    expect(html.getAttribute('data-theme')).toBe('sunset');
  });

  // ── Accent color (--color-primary) ──────────────────────────────────────

  it('sets --color-primary for dark-cosmos', () => {
    applyAppearanceToDom(makeState({ theme: 'dark-cosmos', accentColor: '#FF5733' }));
    expect(html.style.getPropertyValue('--color-primary')).toBe('#FF5733');
  });

  it('sets --color-primary for light-jade', () => {
    applyAppearanceToDom(makeState({ theme: 'light-jade', accentColor: '#00AA55' }));
    expect(html.style.getPropertyValue('--color-primary')).toBe('#00AA55');
  });

  it('removes --color-primary for ink-scroll (has its own palette)', () => {
    // First set a value
    html.style.setProperty('--color-primary', '#FF0000');
    applyAppearanceToDom(makeState({ theme: 'ink-scroll' }));
    expect(html.style.getPropertyValue('--color-primary')).toBe('');
  });

  it('removes --color-primary for sunset (has its own palette)', () => {
    html.style.setProperty('--color-primary', '#FF0000');
    applyAppearanceToDom(makeState({ theme: 'sunset' }));
    expect(html.style.getPropertyValue('--color-primary')).toBe('');
  });

  // ── Contrast detection (--color-on-primary) ────────────────────────────

  it('sets white on-primary for dark accent color', () => {
    applyAppearanceToDom(makeState({ accentColor: '#1a1a2e' }));
    expect(html.style.getPropertyValue('--color-on-primary')).toBe('#ffffff');
  });

  it('sets dark on-primary for light accent color', () => {
    applyAppearanceToDom(makeState({ accentColor: '#FFE74C' }));
    expect(html.style.getPropertyValue('--color-on-primary')).toBe('#111111');
  });

  // ── Font size ───────────────────────────────────────────────────────────

  it('sets data-fontsize attribute', () => {
    applyAppearanceToDom(makeState({ fontSize: 'large' }));
    expect(html.getAttribute('data-fontsize')).toBe('large');
  });

  it('handles all font size values', () => {
    for (const size of ['small', 'medium', 'large', 'xl'] as const) {
      applyAppearanceToDom(makeState({ fontSize: size }));
      expect(html.getAttribute('data-fontsize')).toBe(size);
    }
  });
});
