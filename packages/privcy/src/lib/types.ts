/**
 * Shared types.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.6
 */

export type Categories = Record<
  string,
  {
    name: string;
    description: string;
  }
>;

export type Strings = {
  categories: {
    enable: string;
  };
  buttons: {
    acceptAll: string;
    rejectAll: string;
    customize: string;
    saveSettings: string;
    back: string;
  };
};
