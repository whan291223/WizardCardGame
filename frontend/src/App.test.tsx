import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Simple test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a message', () => {
    render(<div>Hello Vitest</div>);
    expect(screen.getByText('Hello Vitest')).toBeDefined();
  });
});
