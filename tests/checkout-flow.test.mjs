import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import fs from 'node:fs/promises';

// Synthetic data only. No request can reach a real database or Telegram.
process.env.SUPABASE_URL = 'https://checkout-test.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
const { default: handler } = await import('../api/orders.ts');
const { submitOrder } = await import('../src/lib/submitOrder.ts');

const payload = {
  customer_name: 'Тестовий Покупець', customer_email: 'customer@example.invalid',
  customer_phone: '+380000000000', delivery_method: 'nova_poshta',
  delivery_city: 'Київ', delivery_branch: 'Відділення №1',
  payment_method: 'card_prepayment', payment_details: {},
  items: [{ product_id: 'test-product', price: 100, quantity: 1 }], total_amount: 100,
};
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});

beforeEach((t) => {
  t.mock.method(fs, 'readFile', async () => JSON.stringify([
    { id: 'test-product', title: 'Тестовий товар', price: 100, isAvailable: true },
  ]));
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const storage = new Map();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous);
    else delete globalThis.sessionStorage;
  });
});

function connectClientAndApi(t, { loseFirstResponse = false } = {}) {
  const rows = new Map();
  const calls = { notifications: 0, clientIds: [] };
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    if (input === '/api/orders') {
      const body = JSON.parse(options.body);
      calls.clientIds.push(body.request_id);
      const response = {
        code: 0, body: null, setHeader() {},
        status(code) { this.code = code; return this; },
        json(value) { this.body = value; },
      };
      await handler({ method: options.method, body }, response);
      if (loseFirstResponse) {
        loseFirstResponse = false;
        assert.equal(response.code, 201, 'The order was saved before its response was lost');
        throw new TypeError('Simulated lost response');
      }
      return json(response.body, response.code);
    }
    const url = new URL(String(input));
    if (url.origin === 'https://checkout-test.invalid' && url.pathname === '/rest/v1/orders') {
      if (options.method === 'GET') {
        const row = rows.get(url.searchParams.get('id').slice(3));
        return json(row ? [row] : []);
      }
      assert.equal(options.method, 'POST');
      const row = JSON.parse(options.body);
      if (rows.has(row.id)) return json({ code: '23505', message: 'Duplicate ID' }, 409);
      rows.set(row.id, row);
      return json(row, 201);
    }
    assert.equal(url.origin, 'https://api.telegram.org', 'Block unexpected network destinations');
    calls.notifications += 1;
    return json({});
  });
  return { rows, calls };
}

test('client and API recover a saved order after a lost response and client reload', async (t) => {
  const { rows, calls } = connectClientAndApi(t, { loseFirstResponse: true });
  await assert.rejects(submitOrder(payload), /Не вдалося підтвердити результат/);
  assert.equal(rows.size, 1);

  const { submitOrder: afterReload } = await import('../src/lib/submitOrder.ts?checkout-flow-reload');
  const receipt = await afterReload(payload);
  assert.equal(calls.clientIds[0], calls.clientIds[1]);
  assert.equal(receipt.id, calls.clientIds[0]);
  assert.equal(rows.size, 1);
  assert.equal(calls.notifications, 1);
  assert.deepEqual(Object.keys(receipt).sort(), ['id', 'order_number']);
});

test('simultaneous client submissions share one request and return one purchase', async (t) => {
  const { rows, calls } = connectClientAndApi(t);
  const receipts = await Promise.all([submitOrder(payload), submitOrder(payload)]);
  assert.equal(calls.clientIds.length, 1);
  assert.deepEqual(receipts[0], receipts[1]);
  assert.equal(receipts[0].id, calls.clientIds[0]);
  assert.equal(rows.size, 1);
  assert.equal(calls.notifications, 1);
});
