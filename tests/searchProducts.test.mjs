import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { searchProducts } from '../src/lib/searchProducts.ts';

const product = (id, title, category, description) => ({
  id, title, category, description, price: 100, imageUrl: '', isAvailable: true,
});

test('title matches precede category and description matches without duplicates', () => {
  const products = [
    product('lounger', 'Шезлонг', 'Меблі', 'У комплекті є подушка.'),
    product('category', 'Декоративний виріб', 'Подушка', 'Для дому'),
    product('pillow', 'Подушка з принтом', 'Подушка', 'М’яка подушка'),
    product('other', 'Свічка', 'Декор', 'Для затишку'),
  ];

  assert.deepEqual(searchProducts(products, 'подушка').map(({ id }) => id), [
    'pillow', 'category', 'lounger',
  ]);
});

test('search ignores case and outer whitespace and keeps ties in catalogue order', () => {
  const products = [
    product('first', 'Подушка синя', 'Подушки', ''),
    product('second', 'ПОДУШКА біла', 'Подушки', ''),
  ];

  assert.deepEqual(searchProducts(products, '  ПоДуШкА  '), products);
});

test('description-only details remain searchable and no matches return an empty list', () => {
  const products = [product('bag', 'Сумка', 'Аксесуари', 'Матеріал: оксамит')];

  assert.deepEqual(searchProducts(products, 'оксамит'), products);
  assert.deepEqual(searchProducts(products, 'неіснуючийтовар'), []);
});

test('search preserves its input, including for an empty query', () => {
  const products = Object.freeze([
    Object.freeze(product('later', 'Шезлонг', 'Меблі', 'Подушка в комплекті')),
    Object.freeze(product('first', 'Подушка', 'Текстиль', '')),
  ]);

  assert.deepEqual(searchProducts(products, 'подушка').map(({ id }) => id), ['first', 'later']);
  assert.deepEqual(products.map(({ id }) => id), ['later', 'first']);
  assert.deepEqual(searchProducts(products, '  '), products);
});

test('real catalogue puts pillows ahead of loungers that mention a pillow in the description', async () => {
  const products = JSON.parse(await fs.readFile(new URL('../public/products.json', import.meta.url), 'utf8'));
  const results = searchProducts(products, 'подушка');
  const loungerIndex = results.findIndex(({ title }) => title.startsWith('Шезлонг'));
  const lastTitleMatch = results.findLastIndex(({ title }) => title.toLocaleLowerCase('uk').includes('подушка'));

  assert.ok(results.length > 24);
  assert.ok(loungerIndex > lastTitleMatch && lastTitleMatch >= 0);
  assert.ok(results.slice(0, 24).every(({ title }) => title.toLocaleLowerCase('uk').includes('подушка')));
});
