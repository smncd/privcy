/**
 * Banner component.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.9.0
 */

import van, { type State } from 'vanjs-core';
import button from './button';
import type Categories from '../lib/Categories';
import type Controller from '../lib/Controller';
import type { i18nStrings } from '../types';

const { dialog, div, h2, h3, ul, li, p, span, label, input, form } =
  van.tags;

export type BannerProps = {
  controller: Controller;
  categories: Categories;

  isCustomizing: State<boolean>;

  title: string;
  description: string;
  strings: i18nStrings;
};

export default function banner(props: BannerProps) {
  const {
    controller,
    categories,
    isCustomizing,
    title,
    description,
    strings,
  } = props;

  const allowedCategories = () => controller.allowedCategories;

  let requestedCategories = allowedCategories();

  const setCustomizing = (event: Event) => {
    event.preventDefault();
    isCustomizing.val = !isCustomizing.val;
  };

  const includeCategory = (category: string) => {
    if (allowedCategories().includes(category)) {
      requestedCategories = requestedCategories.filter(
        (cat) => cat !== category,
      );
    } else {
      requestedCategories.push(category);
    }
  };

  const categoriesDom = () =>
    categories.toArray().map((category) =>
      li(
        { class: 'privcy__category' },
        h3({ class: 'privcy__category__name' }, category.name),
        p(
          { class: 'privcy__category__description' },
          category.description,
        ),
        label(
          {
            class: 'privcy__category__checkbox',
          },
          input({
            type: 'checkbox',
            checked: allowedCategories().includes(category.id),
            onchange: () => includeCategory(category.id),
          }),
          span(`${strings.categories.enable} ${category.name}`),
        ),
      ),
    );

  return dialog(
    { class: 'privcy', onclose: () => (isCustomizing.val = false) },
    h2({ class: 'privcy__title' }, title),
    div({
      class: 'privcy__description',
      innerHTML: description,
    }),
    () =>
      isCustomizing.val
        ? ul({ class: 'privcy__categories' }, categoriesDom())
        : '',
    form(
      {
        class: 'privcy__buttons',
        method: 'dialog',
      },
      button({ type: 'customize', onClick: setCustomizing }, () =>
        !isCustomizing.val
          ? strings.buttons.customize
          : strings.buttons.back,
      ),
      () =>
        isCustomizing.val
          ? div(
              {
                class: 'privcy__buttons__choices',
              },
              button(
                {
                  type: 'acceptSelected',
                  onClick: () =>
                    controller.updateConsent(requestedCategories),
                },
                strings.buttons.saveSettings,
              ),
            )
          : div(
              {
                class: 'privcy__buttons__choices',
              },
              button(
                {
                  type: 'acceptAll',
                  onClick: () =>
                    controller.updateConsent(categories.IDs),
                },
                strings.buttons.acceptAll,
              ),
              button(
                {
                  type: 'rejectAll',
                  onClick: () => controller.updateConsent([]),
                },
                strings.buttons.rejectAll,
              ),
            ),
    ),
  );
}
