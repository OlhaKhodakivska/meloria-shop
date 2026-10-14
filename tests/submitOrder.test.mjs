import assert from 'node:assert/strict';
import { test } from 'node:test';
import { submitOrder } from '../src/lib/submitOrder.ts';

const payload = { items: [{ product_id: 'test', quantity: 1 }], total_amount: 100 };
const savedOrder = { id: 'test-order-id', order_number: 1 };
const jsonResponse = (value, status = 201) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json' },
});

test('returns the confirmed API order', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/orders');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), payload);
    return jsonResponse({ order: savedOrder });
  });
  const result = await submitOrder(payload);
  assert.deepEqual(result, savedOrder);
});

const uncertainResponses = [
  ['network failure', () => { throw new TypeError('Simulated lost response'); }],
  ['HTML response', () => new Response('<html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } })],
  ['invalid JSON', () => new Response('{', { status: 201, headers: { 'Content-Type': 'application/json' } })],
  ['missing order', () => jsonResponse({})],
  ['missing order ID', () => jsonResponse({ order: {} })],
  ['blank order ID', () => jsonResponse({ order: { id: ' ' } })],
];

for (const [label, getResponse] of uncertainResponses) {
  test(`does not create a fallback order after ${label}`, async (t) => {
    let requests = 0;
    t.mock.method(globalThis, 'fetch', async () => { requests += 1; return getResponse(); });
    await assert.rejects(
      submitOrder(payload),
      /Не вдалося підтвердити результат/,
    );
    assert.equal(requests, 1);
  });
}

for (const status of [400, 409, 500]) {
  test(`shows the API error for HTTP ${status} without a fallback`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ error: 'Тестова помилка' }, status));
    await assert.rejects(
      submitOrder(payload),
      /Тестова помилка/,
    );
  });
}

test('reports an absent API without attempting any second write', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests += 1;
    return new Response('', { status: 404 });
  });
  await assert.rejects(submitOrder(payload), /тимчасово недоступне/);
  assert.equal(requests, 1);
});
