import { describe, expect, it } from 'vitest';
import { c } from './helpers';

describe('c()', () => {
  it('should space words by __', () => {
    const result = c('hero', 'title', 'icon');

    expect(result).to.eq('privcy__hero__title__icon');
  });

  it('should have prefix', () => {
    const result = c('element');

    expect(result.startsWith('privcy__')).to.true;
  });

  it('should work with any input', () => {
    // @ts-ignore
    const result = c(0, -2.5, true);

    expect(result).to.eq('privcy__0__-2.5__true');
  });
});
