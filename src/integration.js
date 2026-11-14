import { sameOrder } from './http.js';

// The persisted local order ID is also the stable upstream idempotency key.
// A timeout means “unknown outcome”, not “nothing happened”.
export async function deliverOrder(order, config) {
  try {
    const response = await fetch(`${config.warehouseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.warehouseKey}`,
        'Idempotency-Key': order.id,
      },
      body: JSON.stringify({ reference: order.reference, sku: order.sku, quantity: order.quantity }),
      signal: AbortSignal.timeout(config.requestTimeoutMs),
      redirect: 'error',
    });
    if (response.status === 429) {
      return { status: 'failed', httpStatus: 502, code: 'WAREHOUSE_RATE_LIMITED', message: 'The warehouse is busy. Wait before manually retrying this same order.' };
    }
    if (response.status === 409) {
      return { status: 'failed', httpStatus: 502, code: 'WAREHOUSE_CONFLICT', message: 'The warehouse rejected reuse of this key with changed order data. Investigate before retrying.' };
    }
    if ([400, 401, 403].includes(response.status)) {
      return { status: 'failed', httpStatus: 502, code: 'WAREHOUSE_REJECTED', message: 'The warehouse rejected the request. Check configuration and the contract before retrying.' };
    }
    if (!response.ok) {
      return { status: 'uncertain', httpStatus: 502, code: 'WAREHOUSE_UNAVAILABLE', message: 'The warehouse returned an error. The outcome is uncertain; retry only this same order.' };
    }
    const data = await response.json();
    if (!data.order || typeof data.order.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(data.order.id) || !sameOrder(data.order, order)) {
      return { status: 'uncertain', httpStatus: 502, code: 'WAREHOUSE_INVALID_RESPONSE', message: 'The warehouse response did not match the order. Do not mark it sent without evidence.' };
    }
    return { status: 'sent', httpStatus: 200, warehouseId: data.order.id };
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    return { status: 'uncertain', httpStatus: timedOut ? 504 : 502, code: timedOut ? 'WAREHOUSE_TIMEOUT' : 'WAREHOUSE_CONNECTION_ERROR', message: 'No confirmed warehouse response. The order may already exist there. Retry this same order to reuse its key.' };
  }
}
