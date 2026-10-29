import { describe, expect, it } from 'vitest';
import { startupMessage } from './startup-message.js';

describe('startupMessage', () => {
  it('includes the Node version', () => {
    expect(startupMessage('v24.0.0')).toBe('brAIn server placeholder (Node v24.0.0)');
  });
});
