import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { submitOrder } from '../src/lib/submitOrder.ts';

beforeEach((t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const values = new Map();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'sessionStorage', original);
    else delete globalThis.sessionStorage;
  });
});

const payload = { items: [{ product_id: 'test', quantity: 1 }], total_amount: 100 };
const savedOrder = { id: 'test-order-id', order_number: 1 };
const jsonResponse = (value, status = 201) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json' },
});

test('returns the confirmed API order', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/orders');
    assert.equal(options.method, 'POST');
    const { request_id, ...sent } = JSON.parse(options.body);
    assert.match(request_id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(sent, payload);
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

test('reuses the ID after a lost response and a module reload, then creates a new purchase', async (t) => {
  const ids = [];
  let loseResponse = true;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    ids.push(JSON.parse(options.body).request_id);
    if (loseResponse) throw new TypeError('Lost response');
    return jsonResponse({ order: savedOrder });
  });
  await assert.rejects(submitOrder(payload));
  const { submitOrder: afterReload } = await import('../src/lib/submitOrder.ts?reload');
  loseResponse = false;
  await afterReload(payload);
  await afterReload(payload);
  assert.equal(ids[0], ids[1]);
  assert.notEqual(ids[1], ids[2]);
});

test('retains separate IDs for unresolved payloads without storing customer data', async (t) => {
  const ids = [];
  const stored = new Map();
  t.mock.method(sessionStorage, 'getItem', (key) => stored.get(key) ?? null);
  t.mock.method(sessionStorage, 'setItem', (key, value) => stored.set(key, value));
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    ids.push(JSON.parse(options.body).request_id);
    throw new TypeError('Lost response');
  });
  const first = { ...payload, customer_email: 'private@example.invalid' };
  await assert.rejects(submitOrder(first));
  await assert.rejects(submitOrder({ ...first, total_amount: 200 }));
  await assert.rejects(submitOrder(first));
  assert.equal(ids[0], ids[2]);
  assert.notEqual(ids[0], ids[1]);
  assert.equal(stored.size, 2);
  for (const [key, value] of stored) {
    assert.match(key, /^meloria_order_request:[a-f0-9]{64}$/);
    assert.match(value, /^[a-f0-9-]{36}$/);
  }
});

test('does not submit when persistent request storage is unavailable', async (t) => {
  t.mock.method(sessionStorage, 'setItem', () => { throw new Error('Storage blocked'); });
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => { requests += 1; throw new Error('Blocked'); });
  await assert.rejects(submitOrder(payload), /дозвольте збереження/);
  assert.equal(requests, 0);
});
