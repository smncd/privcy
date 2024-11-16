/**
 * Categories class.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.6.0
 */

type Data = Record<
  string,
  {
    name: string;
    description: string;
  }
>;

export default class Categories {
  /**
   * Array containing the IDs of categories.
   */
  public IDs: Array<string>;

  /**
   * Constructor for the Categories class.
   * @param data - Record containing category data.
   */
  constructor(public data: Data) {
    this.IDs = Object.keys(data);
  }

  /**
   * Converts the category data into an array of objects.
   * @returns An array of category objects with id, name, and description.
   */
  public toArray(): Array<{
    id: string;
    name: string;
    description: string;
  }> {
    return Object.entries(this.data).map(([id, category]) => ({
      id,
      ...category,
    }));
  }
}
