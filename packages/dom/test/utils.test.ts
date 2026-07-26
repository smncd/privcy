import { describe, it, expect } from 'vitest';
import { htmlStringToCollection } from '../src/utils';

describe('htmlStringToCollection', () => {
  it('returns element children for valid HTML', () => {
    const result = htmlStringToCollection('<div>one</div><span>two</span>');

    expect(result.length).toBe(2);
    expect(result[0].tagName).toBe('DIV');
    expect(result[0].textContent).toBe('one');
    expect(result[1].tagName).toBe('SPAN');
    expect(result[1].textContent).toBe('two');
  });

  it('trims input before parsing', () => {
    const result = htmlStringToCollection('   <section>trimmed</section>   ');

    expect(result.length).toBe(1);
    expect(result[0].tagName).toBe('SECTION');
    expect(result[0].textContent).toBe('trimmed');
  });

  it('removes normal script tags', () => {
    const result = htmlStringToCollection(
      '<div>safe</div><script>alert("xss")</script><span>ok</span>'
    );

    expect(result.length).toBe(2);
    expect(result[0].tagName).toBe('DIV');
    expect(result[1].tagName).toBe('SPAN');
    expect(Array.from(result).some((el) => el.tagName === 'SCRIPT')).toBe(false);
  });

  it('removes sneaky script tags with attributes/newlines/mixed case', () => {
    const dirty = `
      <div>before</div>
      <ScRiPt type="text/javascript" data-evil="1">
        window.__PWNED__ = true;
      </ScRiPt>
      <script
        src="https://evil.example/x.js"
        async
      ></script>
      <span>after</span>
    `;

    const result = htmlStringToCollection(dirty);

    expect(result.length).toBe(2);
    expect(result[0].tagName).toBe('DIV');
    expect(result[1].tagName).toBe('SPAN');
    expect(Array.from(result).map((el) => el.tagName)).not.toContain('SCRIPT');
    expect(Array.from(result).some((el) => el.outerHTML.toLowerCase().includes('<script'))).toBe(
      false
    );
  });

  it('keeps non-script lookalike tags', () => {
    const result = htmlStringToCollection('<description>script-ish text</description><p>ok</p>');

    expect(result.length).toBe(2);
    expect(result[0].tagName).toBe('DESCRIPTION');
    expect(result[1].tagName).toBe('P');
  });

  it('wraps plain text in a paragraph', () => {
    const result = htmlStringToCollection('hello world');

    expect(result.length).toBe(1);
    expect(result[0].tagName).toBe('P');
    expect(result[0].textContent).toBe('hello world');
  });

  it('handles empty input', () => {
    const result = htmlStringToCollection('   ');
    expect(result.length).toBe(0);
  });

  it('wraps script-only input into a paragraph after scripts are removed', () => {
    const result = htmlStringToCollection(`
      <script>console.log("only script")</script>
      <ScRipT type="module">import 'evil'</ScRipT>
    `);

    expect(result.length).toBe(1);
    expect(result[0].tagName).toBe('P');
    expect(result[0].textContent?.trim()).toBe('');
  });

  it('does not wrap when input already contains HTML tags', () => {
    const result = htmlStringToCollection('<em>already html</em>');

    expect(result.length).toBe(1);
    expect(result[0].tagName).toBe('EM');
    expect(result[0].textContent).toBe('already html');
  });
});
