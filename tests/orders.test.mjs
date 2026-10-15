import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import fs from 'node:fs/promises';
import { join } from 'node:path';

// Synthetic configuration only. Every network request is intercepted below.
process.env.SUPABASE_URL = 'https://orders-test.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.TELEGRAM_CHAT_ID = 'test-chat-id';

const catalogueProduct = {
  id: 'test-product', title: 'Тестовий товар', price: 100,
  category: 'Подушки', imageUrl: '', description: '', isAvailable: true,
};

beforeEach((t) => {
  t.mock.method(fs, 'readFile', async (path) => {
    assert.equal(path, join(process.cwd(), 'public/products.json'));
    return JSON.stringify([catalogueProduct]);
  });
});

// Existing tests focus on writes and notifications; fresh IDs have no saved row.
function mockNetwork(t, callback) {
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    if (String(input).startsWith('https://orders-test.invalid/rest/v1/orders') && options.method === 'GET') {
      const url = new URL(String(input));
      assert.equal(url.searchParams.get('id'), `eq.${order.request_id}`);
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }
    return callback(input, options);
  });
}

const { default: handler } = await import('../api/orders.ts');

const order = {
  id: '8d57f610-51a6-4085-91dc-70ef6b99a1cd',
  request_id: '8d57f610-51a6-4085-91dc-70ef6b99a1cd',
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
    mockNetwork(t, async (input) => {
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
  ['missing request ID', { ...order, request_id: undefined }],
  ['invalid request ID', { ...order, request_id: 'bad-id' }],
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
    mockNetwork(t, async () => {
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
  mockNetwork(t, async (input, options) => {
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
  mockNetwork(t, async (input) => {
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

const catalogueConflicts = [
  ['unknown product', { ...order, items: [{ product_id: 'unknown', price: 100, quantity: 1 }] }],
  ['forged price', { ...order, items: [{ product_id: 'test-product', price: 1, quantity: 1 }], total_amount: 1 }],
  ['forged total', { ...order, total_amount: 1 }],
  ['repeated product', { ...order, items: [...order.items, ...order.items], total_amount: 200 }],
  ['total exceeding database precision', { ...order, items: [{ product_id: 'test-product', price: 100, quantity: Number.MAX_SAFE_INTEGER }] }],
];

for (const [label, body] of catalogueConflicts) {
  test(`rejects ${label} before saving the order`, async (t) => {
    let requests = 0;
    mockNetwork(t, async () => {
      requests += 1;
      throw new Error('Unexpected network request blocked by test');
    });
    const response = createResponse();
    await handler({ method: 'POST', body }, response);
    assert.equal(response.statusCode, 409);
    assert.equal(requests, 0);
  });
}

test('rejects a product marked unavailable in the catalogue', async (t) => {
  t.mock.method(fs, 'readFile', async () => JSON.stringify([{ ...catalogueProduct, isAvailable: false }]));
  let requests = 0;
  mockNetwork(t, async () => { requests += 1; throw new Error('Blocked'); });
  const response = createResponse();
  await handler({ method: 'POST', body: order }, response);
  assert.equal(response.statusCode, 409);
  assert.equal(requests, 0);
});

test('stores catalogue details and calculates decimal totals in kopiykas', async (t) => {
  t.mock.method(fs, 'readFile', async () => JSON.stringify([
    { ...catalogueProduct, price: 0.1 },
    { ...catalogueProduct, id: 'second-product', price: 0.2 },
  ]));
  let inserted;
  mockNetwork(t, async (input, options) => {
    if (String(input).startsWith('https://orders-test.invalid/rest/v1/orders')) {
      inserted = JSON.parse(options.body);
      return new Response(JSON.stringify({ ...inserted, id: order.id }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (String(input).startsWith('https://api.telegram.org/bottest-bot-token/')) return new Response('{}');
    throw new Error('Unexpected network request blocked by test');
  });
  const response = createResponse();
  await handler({ method: 'POST', body: {
    ...order,
    items: [
      { product_id: 'test-product', price: 0.1, quantity: 1, title: 'Forged title', category: 'Forged category', image_url: 'Forged image' },
      { product_id: 'second-product', price: 0.2, quantity: 1 },
    ],
    total_amount: 0.1 + 0.2,
  } }, response);
  assert.equal(response.statusCode, 201);
  assert.equal(inserted.total_amount, 0.3);
  assert.equal(inserted.items[0].title, catalogueProduct.title);
  assert.equal(inserted.items[0].category, catalogueProduct.category);
  assert.equal(inserted.items[0].image_url, catalogueProduct.imageUrl);
});

test('does not save an order when the catalogue file cannot be read', async (t) => {
  t.mock.method(console, 'error', () => {});
  t.mock.method(fs, 'readFile', async () => { throw new Error('Simulated missing file'); });
  let requests = 0;
  mockNetwork(t, async () => { requests += 1; throw new Error('Blocked'); });
  const response = createResponse();
  await handler({ method: 'POST', body: order }, response);
  assert.equal(response.statusCode, 500);
  assert.equal(requests, 0);
});

test('does not use a public key when the server secret is missing', async (t) => {
  const previousSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousPublicKey = process.env.VITE_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
  try {
    let requests = 0;
    mockNetwork(t, async () => {
      requests += 1;
      throw new Error('Unexpected network request blocked by test');
    });
    const { default: handlerWithoutSecret } = await import('../api/orders.ts?missing-server-secret');
    const response = createResponse();
    await handlerWithoutSecret({ method: 'POST', body: order }, response);
    assert.equal(response.statusCode, 503);
    assert.equal(requests, 0);
  } finally {
    if (previousSecret === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousSecret;
    if (previousPublicKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY;
    else process.env.VITE_SUPABASE_ANON_KEY = previousPublicKey;
  }
});

test('stores payment details as text and supports a database without order_number', async (t) => {
  const paymentDetails = { type: 'card', recipient: 'Тестовий отримувач', card: 'TEST_CARD' };
  let inserted;
  mockNetwork(t, async (input, options) => {
    if (String(input).startsWith('https://orders-test.invalid/rest/v1/orders')) {
      inserted = JSON.parse(options.body);
      return new Response(JSON.stringify({ ...inserted, id: order.id }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (String(input).startsWith('https://api.telegram.org/bottest-bot-token/')) return new Response('{}');
    throw new Error('Unexpected network request blocked by test');
  });
  const response = createResponse();
  await handler({ method: 'POST', body: { ...order, payment_details: paymentDetails } }, response);
  assert.equal(response.statusCode, 201);
  assert.equal(typeof inserted.payment_details, 'string');
  assert.deepEqual(JSON.parse(inserted.payment_details), paymentDetails);
  assert.equal(response.body.order.id, order.id);
  assert.equal(response.body.order.order_number, undefined);
});

function mockOrderDatabase(t, { concurrent = false, lookupFailure = false } = {}) {
  const rows = new Map();
  const calls = { inserts: 0, notifications: 0, lookups: 0 };
  let releaseLookups;
  const bothLookedUp = new Promise((resolve) => { releaseLookups = resolve; });
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(String(input));
    if (url.origin === 'https://orders-test.invalid' && url.pathname === '/rest/v1/orders') {
      if (options.method === 'GET') {
        calls.lookups += 1;
        if (lookupFailure) return new Response(JSON.stringify({ code: 'TEST', message: 'private DB detail' }), { status: 500 });
        const id = url.searchParams.get('id').slice(3);
        const existing = rows.get(id);
        if (concurrent && calls.lookups <= 2) {
          if (calls.lookups === 2) releaseLookups();
          await bothLookedUp;
        }
        return new Response(JSON.stringify(existing ? [existing] : []), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      assert.equal(options.method, 'POST');
      calls.inserts += 1;
      const inserted = JSON.parse(options.body);
      if (rows.has(inserted.id)) {
        return new Response(JSON.stringify({ code: '23505', message: 'duplicate primary key' }), {
          status: 409, headers: { 'Content-Type': 'application/json' },
        });
      }
      rows.set(inserted.id, inserted);
      return new Response(JSON.stringify(inserted), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }
    assert.equal(url.origin, 'https://api.telegram.org');
    calls.notifications += 1;
    return new Response('{}');
  });
  return { rows, calls };
}

test('a retry after a lost response returns only the receipt, even if the catalogue changes', async (t) => {
  const { rows, calls } = mockOrderDatabase(t);
  const first = createResponse();
  await handler({ method: 'POST', body: order }, first);
  assert.equal(first.statusCode, 201);
  assert.deepEqual(first.body, { order: { id: order.request_id } });
  t.mock.method(fs, 'readFile', async () => { throw new Error('Catalogue should not be read on a retry'); });
  const retry = createResponse();
  await handler({ method: 'POST', body: order }, retry);
  assert.equal(retry.statusCode, 200);
  assert.deepEqual(retry.body, first.body);
  assert.equal(rows.size, 1);
  assert.equal(calls.inserts, 1);
  assert.equal(calls.notifications, 1);
});

for (const changed of [
  { delivery_city: 'Львів' },
  { customer_email: 'other@example.invalid' },
  { items: [{ product_id: 'test-product', price: 100, quantity: 2 }], total_amount: 200 },
  { payment_method: 'iban_prepayment' },
  { comment: 'Інший коментар' },
]) {
  test(`rejects a reused ID with changed ${Object.keys(changed)[0]}`, async (t) => {
    const { rows, calls } = mockOrderDatabase(t);
    await handler({ method: 'POST', body: order }, createResponse());
    const response = createResponse();
    await handler({ method: 'POST', body: { ...order, ...changed } }, response);
    assert.equal(response.statusCode, 409);
    assert.equal(rows.size, 1);
    assert.equal(calls.inserts, 1);
    assert.equal(calls.notifications, 1);
    assert.equal(JSON.stringify(response.body).includes(order.customer_email), false);
  });
}

test('concurrent identical requests create one order and one notification', async (t) => {
  const { rows, calls } = mockOrderDatabase(t, { concurrent: true });
  const responses = [createResponse(), createResponse()];
  await Promise.all(responses.map((response) => handler({ method: 'POST', body: order }, response)));
  assert.deepEqual(responses.map((response) => response.statusCode).sort(), [200, 201]);
  assert.deepEqual(responses[0].body, responses[1].body);
  assert.equal(calls.inserts, 2); // The second insert meets the primary-key constraint.
  assert.equal(rows.size, 1);
  assert.equal(calls.notifications, 1);
});

test('concurrent different requests cannot share an ID', async (t) => {
  const { rows, calls } = mockOrderDatabase(t, { concurrent: true });
  const responses = [createResponse(), createResponse()];
  await Promise.all([
    handler({ method: 'POST', body: order }, responses[0]),
    handler({ method: 'POST', body: { ...order, delivery_city: 'Львів' } }, responses[1]),
  ]);
  assert.deepEqual(responses.map((response) => response.statusCode).sort(), [201, 409]);
  assert.equal(rows.size, 1);
  assert.equal(calls.notifications, 1);
});

test('does not write an order when the retry lookup fails', async (t) => {
  const { rows, calls } = mockOrderDatabase(t, { lookupFailure: true });
  const response = createResponse();
  await handler({ method: 'POST', body: order }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(rows.size, 0);
  assert.equal(calls.inserts, 0);
  assert.equal(calls.notifications, 0);
  assert.equal(JSON.stringify(response.body).includes('private DB detail'), false);
});
