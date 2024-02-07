/**
 * Categories class.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since @next
 */

export default class Categories {
  public IDs: Array<string>;

  constructor(
    public data: Record<
      string,
      {
        name: string;
        description: string;
      }
    >,
  ) {
    this.IDs = Object.keys(data);
  }

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
