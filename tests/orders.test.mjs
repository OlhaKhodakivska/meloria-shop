import assert from 'node:assert/strict';
import { test } from 'node:test';

// Synthetic configuration only. Every network request is intercepted below.
process.env.SUPABASE_URL = 'https://orders-test.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.TELEGRAM_CHAT_ID = 'test-chat-id';

const { default: handler } = await import('../api/orders.ts');

const order = {
  id: 'test-order-id',
  order_number: 1,
  customer_name: 'Тестовий Покупець',
  customer_email: 'customer@example.invalid',
  customer_phone: '+380000000000',
  delivery_method: 'nova_poshta',
  delivery_city: 'Київ',
  delivery_branch: 'Відділення №1',
  payment_method: 'card_prepayment',
  payment_status: 'awaiting_prepayment',
  payment_details: {},
  items: [{ product_id: 'test-product', price: 100, quantity: 1 }],
  total_amount: 100,
  status: 'new',
};

for (const notificationResult of ['success', 'network failure', 'HTTP failure']) {
  test(`saved order stays successful after Telegram ${notificationResult}`, async (t) => {
    let insertCount = 0;
    let notificationCount = 0;
    let statusCode;
    let responseBody;

    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async (input) => {
      const url = String(input);

      if (url.startsWith('https://orders-test.invalid/rest/v1/orders')) {
        insertCount += 1;
        return new Response(JSON.stringify(order), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.startsWith('https://api.telegram.org/bottest-bot-token/')) {
        notificationCount += 1;
        if (notificationResult === 'network failure') {
          throw new TypeError('Simulated network failure');
        }
        return new Response('{}', {
          status: notificationResult === 'HTTP failure' ? 503 : 200,
        });
      }

      throw new Error('Unexpected network request blocked by test');
    });

    const response = {
      setHeader() {},
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        responseBody = body;
      },
    };

    await handler({ method: 'POST', body: order }, response);

    assert.equal(insertCount, 1);
    assert.equal(notificationCount, 1);
    assert.equal(statusCode, 201);
    assert.equal(responseBody.order.id, order.id);
  });
}

const invalidRequests = [
  ['missing body', undefined],
  ['null body', null],
  ['array body', []],
  ['string body', 'invalid'],
  ['contact field with wrong type', { ...order, customer_name: 123 }],
  ['empty items', { ...order, items: [] }],
  ['items with wrong type', { ...order, items: {} }],
  ['null item', { ...order, items: [null] }],
  ['missing product ID', { ...order, items: [{ price: 100, quantity: 1 }] }],
  ['zero quantity', { ...order, items: [{ product_id: 'test', price: 100, quantity: 0 }] }],
  ['fractional quantity', { ...order, items: [{ product_id: 'test', price: 100, quantity: 1.5 }] }],
  ['negative price', { ...order, items: [{ product_id: 'test', price: -100, quantity: 1 }] }],
  ['price with wrong type', { ...order, items: [{ product_id: 'test', price: '100', quantity: 1 }] }],
  ['negative total', { ...order, total_amount: -100 }],
  ['unknown delivery', { ...order, delivery_method: 'unknown' }],
  ['unknown payment', { ...order, payment_method: 'unknown' }],
  ['comment with wrong type', { ...order, comment: 123 }],
  ['payment details with wrong type', { ...order, payment_details: [] }],
];

function createResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; },
  };
}

for (const [label, body] of invalidRequests) {
  test(`rejects ${label} before any network request`, async (t) => {
    let requests = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      requests += 1;
      throw new Error('Unexpected network request blocked by test');
    });
    const response = createResponse();
    await handler({ method: 'POST', body }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(requests, 0);
  });
}

test('sets initial order and payment statuses on the server', async (t) => {
  let insertedOrder;
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    if (String(input).startsWith('https://orders-test.invalid/rest/v1/orders')) {
      insertedOrder = JSON.parse(options.body);
      return new Response(JSON.stringify({ ...insertedOrder, id: order.id }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (String(input).startsWith('https://api.telegram.org/bottest-bot-token/')) {
      return new Response('{}', { status: 200 });
    }
    throw new Error('Unexpected network request blocked by test');
  });
  const response = createResponse();
  await handler({ method: 'POST', body: { ...order, status: 'completed', payment_status: 'paid' } }, response);
  assert.equal(response.statusCode, 201);
  assert.equal(insertedOrder.status, 'new');
  assert.equal(insertedOrder.payment_status, 'awaiting_prepayment');
});

test('does not expose database error details to the customer', async (t) => {
  t.mock.method(globalThis, 'fetch', async (input) => {
    assert.ok(String(input).startsWith('https://orders-test.invalid/rest/v1/orders'));
    return new Response(JSON.stringify({ code: 'TEST', message: 'internal-database-detail' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  });
  const response = createResponse();
  await handler({ method: 'POST', body: order }, response);
  assert.equal(response.statusCode, 500);
  assert.equal(JSON.stringify(response.body).includes('internal-database-detail'), false);
});
