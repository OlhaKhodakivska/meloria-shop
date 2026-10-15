import assert from 'node:assert/strict';
import { test } from 'node:test';
import { removeOrderedItems } from '../src/lib/removeOrderedItems.ts';

const item = (id, quantity = 1, selected = true) => ({
  product: { id, title: 'Тестовий товар', price: 100 }, quantity, selected,
});
const ordered = [{ product_id: 'ordered', quantity: 2 }];

test('removes submitted products and keeps unselected products', () => {
  const untouched = item('untouched', 3, false);
  assert.deepEqual(removeOrderedItems([item('ordered', 2), untouched], ordered), [untouched]);
});

test('preserves newly selected products while removing the submitted purchase', () => {
  const newlySelected = item('newly-selected', 1, true);
  assert.deepEqual(removeOrderedItems([item('ordered', 2, false), newlySelected], ordered), [newlySelected]);
});

test('preserves extra units added while the order was pending', () => {
  assert.deepEqual(removeOrderedItems([item('ordered', 5)], ordered), [item('ordered', 3)]);
});

test('does not create negative quantities or restore items removed during submission', () => {
  assert.deepEqual(removeOrderedItems([item('ordered', 1)], ordered), []);
  const remaining = item('other');
  assert.deepEqual(removeOrderedItems([remaining], ordered), [remaining]);
});

test('does not mutate the current cart or the submitted snapshot', () => {
  const cart = Object.freeze([Object.freeze(item('ordered', 3)), Object.freeze(item('other'))]);
  const snapshot = Object.freeze([Object.freeze({ product_id: 'ordered', quantity: 2 })]);
  const result = removeOrderedItems(cart, snapshot);
  assert.equal(cart[0].quantity, 3);
  assert.equal(snapshot[0].quantity, 2);
  assert.equal(result[0].quantity, 1);
  assert.notEqual(result[0], cart[0]);
  assert.equal(result[1], cart[1]);
});
