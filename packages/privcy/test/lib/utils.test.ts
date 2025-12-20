import { describe, expect, it } from 'vitest';
import { c, htmlStringToCollection } from '../../src/lib/utils';

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

describe('htmlStringToCollection()', () => {
  it('should pass when given a html string', () => {
    const result = htmlStringToCollection('<p>hello world</p>');

    expect(result.length).to.eq(1);
    expect(result.item(0)?.tagName).to.eq('P');
    expect(result.item(0)?.innerHTML).to.eq('hello world');
  });

  it('should handle multiple elements', () => {
    const result = htmlStringToCollection(
      "<p>hello world</p><strong>i'm excited to meet you</strong>",
    );

    expect(result.length).to.eq(2);

    expect(result.item(0)?.tagName).to.eq('P');
    expect(result.item(0)?.innerHTML).to.eq('hello world');

    expect(result.item(1)?.tagName).to.eq('STRONG');
    expect(result.item(1)?.innerHTML).to.eq(
      "i'm excited to meet you",
    );
  });

  it('should handle non-html strings', () => {
    const result = htmlStringToCollection('hello world');

    expect(result.length).to.eq(1);
    expect(result.item(0)?.tagName).to.eq('P');
    expect(result.item(0)?.innerHTML).to.eq('hello world');
  });

  it('should remove script tags', () => {
    const result = htmlStringToCollection(
      '<script>alert("evil");</script>',
    );

    expect(result.length).to.eq(0);
    expect(result.item(0)?.tagName).to.eq(undefined);
    expect(result.item(0)?.innerHTML).to.eq(undefined);
  });

  it('should return empty if nothing is left after sanitizing ', () => {
    const result = htmlStringToCollection('');

    expect(result.length).to.eq(0);
  });
});
