/**
 * Parses a HTML string to a HTMLCollection.
 */
export function htmlStringToCollection(str: string): HTMLCollection {
  str = str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  if (str !== '' && !/<[^>]+>/.test(str)) {
    str = `<p>${str}</p>`;
  }

  const { body } = new DOMParser().parseFromString(str, 'text/html');

  return body.children;
}
