import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button Component - Exhaustive Suite', () => {
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
  const sizes = ['default', 'sm', 'lg', 'icon'] as const;

  const testLabels = ['Click Me', 'Submit', '12345', '!@#$', 'A very long string that might overflow the button container'];

  describe('1-24: Variant and Size rendering', () => {
    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`renders variant="${variant}" and size="${size}" correctly`, () => {
          render(<Button variant={variant} size={size}>Variations</Button>);
          const btn = screen.getByRole('button', { name: 'Variations' });
          expect(btn).toBeInTheDocument();
          expect(btn.className).to.contain('inline-flex'); 
        });
      });
    });
  });

  describe('25-29: Text content edge cases', () => {
    testLabels.forEach((label) => {
      it(`renders correctly with content: "${label}"`, () => {
        render(<Button>{label}</Button>);
        expect(screen.getByRole('button')).toHaveTextContent(label);
      });
    });
  });

  describe('30-34: Attributes and State', () => {
    it('is disabled when disabled prop is passed', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('can be focused and blurred', async () => {
      render(<Button>Focus Me</Button>);
      const btn = screen.getByRole('button');
      btn.focus();
      expect(btn).toHaveFocus();
      btn.blur();
      expect(btn).not.toHaveFocus();
    });

    it('passes custom className to the underlying element', () => {
      render(<Button className="super-custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('super-custom-class');
    });

    it('fires onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Clickable</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
