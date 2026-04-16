import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Flashcard } from '@/components/Flashcard';

describe('Flashcard Component', () => {
  const defaultProps = {
    character: '猫',
    pinyin: 'māo',
    meaning: 'cat',
    onResult: vi.fn(),
  };

  it('renders the character on the front of the card', () => {
    render(<Flashcard {...defaultProps} />);
    expect(screen.getByText('猫')).toBeInTheDocument();
    expect(screen.getByText(/Tap to reveal/)).toBeInTheDocument();
  });

  it('renders pinyin and meaning on the back of the card', () => {
    render(<Flashcard {...defaultProps} />);
    expect(screen.getByText('māo')).toBeInTheDocument();
    expect(screen.getByText('cat')).toBeInTheDocument();
  });

  it('calls onResult with true when "Got it" is clicked', () => {
    render(<Flashcard {...defaultProps} />);
    
    // We shouldn't need to click the card to reveal it for jsdom, 
    // the buttons are rendered (just obscured by CSS backface-visibility).
    const gotItButton = screen.getByRole('button', { name: 'Got it' });
    fireEvent.click(gotItButton);
    
    expect(defaultProps.onResult).toHaveBeenCalledWith(true);
  });

  it('calls onResult with false when "Again" is clicked', () => {
    render(<Flashcard {...defaultProps} />);
    
    const againButton = screen.getByRole('button', { name: 'Again' });
    fireEvent.click(againButton);
    
    expect(defaultProps.onResult).toHaveBeenCalledWith(false);
  });
});
