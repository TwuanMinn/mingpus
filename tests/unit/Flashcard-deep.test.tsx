import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Flashcard } from '@/components/Flashcard';

describe('Flashcard Component — Deep Interaction Suite', () => {
  const createProps = (overrides = {}) => ({
    character: '猫',
    pinyin: 'māo',
    meaning: 'cat',
    onResult: vi.fn(),
    ...overrides,
  });

  describe('rendering', () => {
    it('renders character in front view', () => {
      render(<Flashcard {...createProps()} />);
      expect(screen.getByText('猫')).toBeInTheDocument();
    });

    it('renders "Tap to reveal" prompt', () => {
      render(<Flashcard {...createProps()} />);
      expect(screen.getByText(/Tap to reveal/)).toBeInTheDocument();
    });

    it('renders pinyin text', () => {
      render(<Flashcard {...createProps()} />);
      expect(screen.getByText('māo')).toBeInTheDocument();
    });

    it('renders meaning text', () => {
      render(<Flashcard {...createProps()} />);
      expect(screen.getByText('cat')).toBeInTheDocument();
    });

    it('renders with multi-character string', () => {
      render(<Flashcard {...createProps({ character: '学习', pinyin: 'xué xí', meaning: 'to study' })} />);
      expect(screen.getByText('学习')).toBeInTheDocument();
      expect(screen.getByText('xué xí')).toBeInTheDocument();
      expect(screen.getByText('to study')).toBeInTheDocument();
    });

    it('renders with special characters in meaning', () => {
      render(<Flashcard {...createProps({ meaning: "it's a cat / feline" })} />);
      expect(screen.getByText("it's a cat / feline")).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('has "Got it" and "Again" buttons', () => {
      render(<Flashcard {...createProps()} />);
      expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Again' })).toBeInTheDocument();
    });

    it('calls onResult(true) when "Got it" is clicked', () => {
      const props = createProps();
      render(<Flashcard {...props} />);
      fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
      expect(props.onResult).toHaveBeenCalledWith(true);
      expect(props.onResult).toHaveBeenCalledTimes(1);
    });

    it('calls onResult(false) when "Again" is clicked', () => {
      const props = createProps();
      render(<Flashcard {...props} />);
      fireEvent.click(screen.getByRole('button', { name: 'Again' }));
      expect(props.onResult).toHaveBeenCalledWith(false);
      expect(props.onResult).toHaveBeenCalledTimes(1);
    });

    it('can handle rapid clicks without crashing', () => {
      const props = createProps();
      render(<Flashcard {...props} />);
      const btn = screen.getByRole('button', { name: 'Got it' });
      for (let i = 0; i < 10; i++) {
        fireEvent.click(btn);
      }
      expect(props.onResult).toHaveBeenCalledTimes(10);
    });
  });

  describe('different character sets', () => {
    const testCases = [
      { character: '龙', pinyin: 'lóng', meaning: 'dragon' },
      { character: '美', pinyin: 'měi', meaning: 'beautiful' },
      { character: '飞', pinyin: 'fēi', meaning: 'to fly' },
      { character: '我爱你', pinyin: 'wǒ ài nǐ', meaning: 'I love you' },
    ];

    testCases.forEach(({ character, pinyin, meaning }) => {
      it(`renders "${character}" correctly`, () => {
        render(<Flashcard {...createProps({ character, pinyin, meaning })} />);
        expect(screen.getByText(character)).toBeInTheDocument();
        expect(screen.getByText(pinyin)).toBeInTheDocument();
        expect(screen.getByText(meaning)).toBeInTheDocument();
      });
    });
  });
});
