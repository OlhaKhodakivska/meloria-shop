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
