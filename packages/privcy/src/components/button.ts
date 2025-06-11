/**
 * Button component.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.9.0
 */

import tag, { type TagChildren, type TagOptions } from '../lib/tag';
import { c } from '../lib/utils';

export default function button(
  options: TagOptions<'button'> & {
    buttonType: string;
  },
  ...children: TagChildren
) {
  const className = c('button');
  const classlist = [
    className,
    options.buttonType && `${className}--${options.buttonType}`,
  ].join(' ');

  return tag(
    'button',
    {
      ...options,
      class: classlist,
    },
    ...children,
  );
}
