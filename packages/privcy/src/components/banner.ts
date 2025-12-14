/**
 * Banner component.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.9.0
 */

import tag from '../lib/tag';
import button from './button';
import { c, parseHtmlString } from '../lib/utils';
import type Categories from '../lib/categories';
import type Controller from '../lib/controller';
import type { i18nStrings, ViewState } from '../types';
import type { Subscriber } from '../lib/reactive';

export type BannerProps = {
  controller: Controller;
  categories: Categories;

  viewState: ViewState;
  viewStateListen: Subscriber<ViewState>;

  title: string;
  description: string;
  strings: i18nStrings;
};

export default function banner(props: BannerProps) {
  const {
    controller,
    categories,
    viewState,
    viewStateListen,
    title,
    description,
    strings,
  } = props;

  const allowedCategories = () => controller.allowedCategories;

  let requestedCategories = allowedCategories();

  const setCustomizing = (event: Event) => {
    event.preventDefault();
    viewState.isCustomizing = !viewState.isCustomizing;
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
      tag(
        'li',
        { class: c('category') },
        tag('h3', { class: c('category', 'name') }, category.name),
        tag(
          'p',
          { class: c('category', 'description') },
          category.description,
        ),
        tag(
          'label',
          {
            class: c('category', 'checkbox'),
          },
          tag('input', {
            type: 'checkbox',
            checked: allowedCategories().includes(category.id),
            onchange: () => includeCategory(category.id),
          }),
          tag(
            'span',
            {},
            `${strings.categories.enable} ${category.name}`,
          ),
        ),
      ),
    );

  const categoriesList = tag('ul', { class: c('categories') });
  viewStateListen(({ isCustomizing }) => {
    categoriesList.replaceChildren(
      ...(isCustomizing ? categoriesDom() : []),
    );
  });

  const form = (() => {
    const customizeButton = button({
      buttonType: 'customize',
      onclick: setCustomizing,
      innerText: strings.buttons.customize,
    });
    viewStateListen(({ isCustomizing }) => {
      customizeButton.innerText = isCustomizing
        ? strings.buttons.back
        : strings.buttons.customize;
    });

    const choices = tag('div', {
      class: c('buttons', 'choices'),
    });
    viewStateListen(
      ({ isCustomizing }) => {
        choices.replaceChildren(
          ...(isCustomizing
            ? [
                button(
                  {
                    buttonType: 'acceptSelected',
                    onclick: () => {
                      const willReload =
                        requestedCategories.length <
                        allowedCategories().length;

                      controller.updateConsent(requestedCategories);

                      if (willReload) location.reload();
                    },
                  },
                  strings.buttons.saveSettings,
                ),
              ]
            : [
                button(
                  {
                    buttonType: 'acceptAll',
                    onclick: () =>
                      controller.updateConsent(categories.IDs),
                  },
                  strings.buttons.acceptAll,
                ),
                button(
                  {
                    buttonType: 'rejectAll',
                    onclick: () => {
                      const willReload =
                        allowedCategories().length > 0;
                      controller.updateConsent([]);

                      if (willReload) location.reload();
                    },
                  },
                  strings.buttons.rejectAll,
                ),
              ]),
        );
      },
      { initialRun: true },
    );

    return tag(
      'form',
      {
        class: c('buttons'),
        method: 'dialog',
      },
      customizeButton,
      choices,
    );
  })();

  const dialog = tag(
    'dialog',
    {
      class: c(),
      onclose: () => (viewState.isCustomizing = false),
    },
    tag('h2', { class: c('title') }, title),
    tag('div', {
      class: c('description'),
      innerHTML: parseHtmlString(description),
    }),
    categoriesList,
    form,
  );

  return dialog;
}
