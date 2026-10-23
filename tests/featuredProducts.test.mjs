import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { getFeaturedProducts } from '../src/lib/featuredProducts.ts';

test('featured selection supports empty and single-product catalogues', () => {
  assert.deepEqual(getFeaturedProducts([]), []);
  const product = { id: 'only', price: 50 };
  assert.deepEqual(getFeaturedProducts([product]), [product]);
});

test('the first most expensive product remains first when prices are tied', () => {
  const products = [
    { id: 'cheap', price: 10 },
    { id: 'first', price: 50 },
    { id: 'second', price: 50 },
  ];
  assert.equal(getFeaturedProducts(products)[0], products[1]);
});

test('featured ordering preserves all products without mutating the source', () => {
  const products = Object.freeze(Array.from({ length: 100 }, (_, index) =>
    Object.freeze({ id: String(index), price: index })));
  const result = getFeaturedProducts(products);
  assert.equal(result.length, products.length);
  assert.equal(new Set(result).size, products.length);
  assert.deepEqual(new Set(result), new Set(products));
  assert.deepEqual(products.map(({ id }) => id), Array.from({ length: 100 }, (_, index) => String(index)));
});

test('the real catalogue remains complete for all subsequent 24-product batches', async () => {
  const products = JSON.parse(await fs.readFile(new URL('../public/products.json', import.meta.url), 'utf8'));
  for (const group of [products, products.filter((product) => (product.deliveryGroup || 'express') === 'express'),
    products.filter((product) => product.deliveryGroup === 'made_to_order')]) {
    const result = getFeaturedProducts(group);
    assert.equal(result.length, group.length);
    assert.deepEqual(new Set(result.map(({ id }) => id)), new Set(group.map(({ id }) => id)));
    assert.equal(result[0]?.price, Math.max(...group.map(({ price }) => price)));
  }
});
