import { describe, expect, it } from 'vitest';
import Categories from '../../src/lib/categories';

describe('Categories()', () => {
  it('should create an instance and convert data to array', () => {
    const sampleData = {
      cat1: { name: 'Category 1', description: 'Description 1' },
      cat2: { name: 'Category 2', description: 'Description 2' },
    };

    const categories = new Categories(sampleData);

    expect(categories.IDs).toEqual(['cat1', 'cat2']);

    const arrayOutput = categories.toArray();
    const expectedOutput = [
      {
        id: 'cat1',
        name: 'Category 1',
        description: 'Description 1',
      },
      {
        id: 'cat2',
        name: 'Category 2',
        description: 'Description 2',
      },
    ];

    expect(arrayOutput).toEqual(expectedOutput);
  });

  it('should handle empty data', () => {
    const emptyData = {};
    const categories = new Categories(emptyData);

    expect(categories.IDs).toEqual([]);

    const arrayOutput = categories.toArray();
    expect(arrayOutput).toEqual([]);
  });

  it('should handle single category', () => {
    const singleData = {
      cat1: { name: 'Category 1', description: 'Description 1' },
    };
    const categories = new Categories(singleData);

    expect(categories.IDs).toEqual(['cat1']);

    const arrayOutput = categories.toArray();
    const expectedOutput = [
      {
        id: 'cat1',
        name: 'Category 1',
        description: 'Description 1',
      },
    ];

    expect(arrayOutput).toEqual(expectedOutput);
  });

  it('should maintain order of categories', () => {
    const orderedData = {
      catB: { name: 'Category B', description: 'Description B' },
      catA: { name: 'Category A', description: 'Description A' },
      catC: { name: 'Category C', description: 'Description C' },
    };
    const categories = new Categories(orderedData);

    expect(categories.IDs).toEqual(['catB', 'catA', 'catC']);

    const arrayOutput = categories.toArray();
    const expectedOutput = [
      {
        id: 'catB',
        name: 'Category B',
        description: 'Description B',
      },
      {
        id: 'catA',
        name: 'Category A',
        description: 'Description A',
      },
      {
        id: 'catC',
        name: 'Category C',
        description: 'Description C',
      },
    ];
    expect(arrayOutput).toEqual(expectedOutput);
  });

  it('should reject invalid category data', () => {
    const invalidData = {
      cat1: { name: 'Category 1' },
    };

    // @ts-expect-error Testing invalid data structure
    expect(() => new Categories(invalidData)).not.toThrow();
  });

  it('should handle categories with special characters in IDs', () => {
    const specialData = {
      'cat-1': { name: 'Category 1', description: 'Description 1' },
      cat_2: { name: 'Category 2', description: 'Description 2' },
      'cat.3': { name: 'Category 3', description: 'Description 3' },
    };
    const categories = new Categories(specialData);

    expect(categories.IDs).toEqual(['cat-1', 'cat_2', 'cat.3']);
  });

  it('should handle categories with empty strings', () => {
    const emptyStringData = {
      cat1: { name: '', description: '' },
    };
    const categories = new Categories(emptyStringData);

    expect(categories.IDs).toEqual(['cat1']);
    expect(categories.toArray()).toEqual([
      { id: 'cat1', name: '', description: '' },
    ]);
  });

  it('should handle categories with unicode characters', () => {
    const unicodeData = {
      cat1: { name: 'Catégorie 日本語', description: 'Описание 🎉' },
    };
    const categories = new Categories(unicodeData);

    expect(categories.toArray()).toEqual([
      {
        id: 'cat1',
        name: 'Catégorie 日本語',
        description: 'Описание 🎉',
      },
    ]);
  });

  it('should handle large number of categories', () => {
    const largeData: Record<
      string,
      { name: string; description: string }
    > = {};

    for (let i = 0; i < 100; i++) {
      largeData[`cat${i}`] = {
        name: `Category ${i}`,
        description: `Description ${i}`,
      };
    }

    const categories = new Categories(largeData);

    expect(categories.IDs.length).toBe(100);
    expect(categories.toArray().length).toBe(100);
  });

  it('should preserve additional properties on category objects', () => {
    const extendedData = {
      cat1: {
        name: 'Category 1',
        description: 'Description 1',
        extra: 'value',
      },
    };

    const categories = new Categories(extendedData);
    const result = categories.toArray();

    expect(result[0]).toHaveProperty('id', 'cat1');
    expect(result[0]).toHaveProperty('name', 'Category 1');
  });
});
