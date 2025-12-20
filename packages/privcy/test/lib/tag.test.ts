import { describe, expect, it } from 'vitest';
import tag from '../../src/lib/tag';

describe('tag()', () => {
  it('succeeds with standard tag', () => {
    const result = tag('a');

    expect(result instanceof HTMLAnchorElement).to.true;
    expect(result.tagName).to.eq('A');
    expect(result.outerHTML).to.eq('<a></a>');
  });

  it('succeeds with custom tag', () => {
    // @ts-ignore
    const result = tag('custom-element');

    expect(result instanceof HTMLElement).to.true;
    expect(result.tagName).to.eq('CUSTOM-ELEMENT');
    expect(result.outerHTML).to.eq(
      '<custom-element></custom-element>',
    );
  });

  it('succeeds with self closing tag', () => {
    const result = tag('img');

    expect(result instanceof HTMLImageElement).to.true;
    expect(result.tagName).to.eq('IMG');
    expect(result.outerHTML).to.eq('<img>');
  });

  it('succeeds with empty options object', () => {
    const result = tag('div', {});

    expect(result.outerHTML).to.eq('<div></div>');
  });

  it('succeeds with undefined options and children', () => {
    const result = tag('div', undefined, 'Hello');

    expect(result.outerHTML).to.eq('<div>Hello</div>');
  });

  it('sets class list from array', () => {
    const result = tag('div', {
      class: ['page-hero', true && '-tall'],
    });

    expect(result.classList.toString()).to.eq('page-hero -tall');
    expect(result.outerHTML).to.eq(
      '<div class="page-hero -tall"></div>',
    );
  });

  it('sets multiple classes from space-separated string', () => {
    const result = tag('div', { class: 'foo bar baz' });

    expect(result.classList.toString()).to.eq('foo bar baz');
    expect(result.outerHTML).to.eq('<div class="foo bar baz"></div>');
  });

  it('handles falsy class values in array', () => {
    const result = tag('div', {
      class: ['active', false ? 'hidden' : '', ''],
    });

    expect(result.classList.contains('active')).to.true;
    expect(result.classList.contains('hidden')).to.false;
    expect(result.outerHTML).to.eq('<div class="active"></div>');
  });

  it('sets standard and custom props', () => {
    const result = tag('div', {
      id: 'foo',
      class: 'bar',
      'data-width': 100,
      open: true,
    });

    expect(result.id).to.eq('foo');
    expect(result.classList.toString()).to.eq('bar');
    expect(result.getAttribute('data-width')).to.eq('100');
    expect(result.getAttribute('open')).to.eq('true');
    expect(result.outerHTML).to.eq(
      '<div id="foo" class="bar" data-width="100" open="true"></div>',
    );
  });

  it('sets boolean-like attributes', () => {
    const result = tag('input', { disabled: true, readonly: true });

    expect(result.getAttribute('disabled')).to.eq('true');
    expect(result.getAttribute('readonly')).to.eq('true');
    expect(result.outerHTML).to.eq(
      '<input disabled="true" readonly="true">',
    );
  });

  it('sets HTMLElement child', () => {
    const result = tag('div', {}, tag('p', {}, 'Goodbye'));

    expect(result.outerHTML).to.eq('<div><p>Goodbye</p></div>');
  });

  it('sets multiple children', () => {
    const result = tag(
      'ul',
      {},
      tag('li', {}, 'One'),
      tag('li', {}, 'Two'),
      tag('li', {}, 'Three'),
    );

    expect(result.children.length).to.eq(3);
    expect(result.outerHTML).to.eq(
      '<ul><li>One</li><li>Two</li><li>Three</li></ul>',
    );
  });

  it('handles deeply nested structures', () => {
    const result = tag(
      'div',
      {},
      tag('section', {}, tag('article', {}, tag('p', {}, 'Deep'))),
    );

    expect(result.outerHTML).to.eq(
      '<div><section><article><p>Deep</p></article></section></div>',
    );
  });

  it('handles HTMLCollection child', () => {
    const container = tag('div', {}, tag('span'), tag('span'));
    const result = tag('ul', {}, container.children);

    expect(result.children.length).to.eq(2);
    expect(result.outerHTML).to.eq(
      '<ul><span></span><span></span></ul>',
    );
  });

  it('sets innerText child', () => {
    const result = tag('h1', {}, 'Welcome!');

    expect(result.innerHTML).to.eq('Welcome!');
    expect(result.outerHTML).to.eq('<h1>Welcome!</h1>');
  });

  it('concatenates multiple text children', () => {
    const result = tag('p', {}, 'Hello ', 'World');

    expect(result.innerText).to.eq('Hello World');
    expect(result.outerHTML).to.eq('<p>Hello World</p>');
  });

  it('handles special characters in text content', () => {
    const result = tag('p', {}, '<script>alert("xss")</script>');

    expect(result.innerText).to.eq('<script>alert("xss")</script>');
    expect(result.innerHTML).to.not.contain('<script>');
    expect(result.outerHTML).to.eq(
      '<p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>',
    );
  });

  it('handles empty string children', () => {
    const result = tag('div', {}, '', 'content', '');

    expect(result.outerHTML).to.eq('<div>content</div>');
  });

  it('handles null children gracefully', () => {
    const result = tag('div', {}, null, tag('span'), null);

    expect(result.children.length).to.eq(1);
    expect(result.outerHTML).to.eq('<div><span></span></div>');
  });

  it('handles mixed children types', () => {
    const result = tag(
      'div',
      {},
      'Text',
      tag('span', {}, 'inner'),
      null,
    );

    expect(result.outerHTML).to.eq(
      '<div>Text<span>inner</span></div>',
    );
  });
});
