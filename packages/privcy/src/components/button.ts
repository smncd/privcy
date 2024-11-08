/**
 * Button component.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since @next
 */

import van from 'vanjs-core';

export default function button(
  props: { type?: string; onClick: (event: Event) => void },
  children: Element | string | (() => Element | string),
) {
  const className = [
    'privcy__button',
    props.type && `privcy__button--${props.type}`,
  ].join(' ');

  return van.tags.button(
    {
      class: className,
      onclick: props.onClick,
    },
    children,
  );
}
