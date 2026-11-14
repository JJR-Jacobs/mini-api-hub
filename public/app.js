const connectForm = document.querySelector('#connect-form');
const orderForm = document.querySelector('#order-form');
const refreshButton = document.querySelector('#refresh-button');
const createButton = document.querySelector('#create-button');
const message = document.querySelector('#message');
const rows = document.querySelector('#orders');
const connectionStatus = document.querySelector('#connection-status');
let apiKey = '';

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) {
    const id = response.headers.get('x-request-id');
    throw new Error(`${data.error?.message ?? 'The request failed.'}${id ? ` Request ID: ${id}` : ''}`);
  }
  return data;
}

async function refresh() {
  const data = await api('/api/orders');
  rows.replaceChildren();
  document.querySelector('#empty').hidden = data.orders.length > 0;
  for (const order of data.orders) {
    const row = document.createElement('tr');
    for (const value of [order.reference, order.sku, order.quantity]) {
      const cell = document.createElement('td');
      // textContent displays user data as text, never as executable HTML.
      cell.textContent = String(value);
      row.append(cell);
    }
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge status-${order.status}`;
    badge.textContent = order.status;
    statusCell.append(badge);
    row.append(statusCell);
    const actionCell = document.createElement('td');
    const button = document.createElement('button');
    button.className = 'secondary small';
    button.textContent = order.status === 'sent' ? 'Confirmed' : order.status === 'pending' ? 'Send order' : 'Retry same order';
    button.disabled = order.status === 'sent';
    button.addEventListener('click', async () => {
      button.disabled = true;
      showMessage(`Sending ${order.reference}…`);
      try {
        await api(`/api/orders/${order.id}/send`, { method: 'POST' });
        showMessage(`${order.reference} is confirmed by the warehouse.`);
      } catch (error) { showMessage(error.message, true); }
      finally {
        try { await refresh(); } catch (error) { showMessage(error.message, true); }
        button.disabled = false;
      }
    });
    actionCell.append(button);
    row.append(actionCell);
    rows.append(row);
  }
}

connectForm.addEventListener('submit', async event => {
  event.preventDefault();
  apiKey = document.querySelector('#api-key').value.trim();
  try {
    await refresh();
    connectionStatus.textContent = 'Connected';
    connectionStatus.classList.add('status-sent');
    refreshButton.disabled = false;
    createButton.disabled = false;
    showMessage('Connected. Create your first fictional order below.');
  } catch (error) {
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.classList.remove('status-sent');
    refreshButton.disabled = true;
    createButton.disabled = true;
    rows.replaceChildren();
    showMessage(error.message, true);
  }
});

orderForm.addEventListener('submit', async event => {
  event.preventDefault();
  createButton.disabled = true;
  try {
    const data = await api('/api/orders', { method: 'POST', body: JSON.stringify({
      reference: document.querySelector('#reference').value,
      sku: document.querySelector('#sku').value,
      quantity: Number(document.querySelector('#quantity').value),
    }) });
    await refresh();
    showMessage(`${data.order.reference} is saved. Use “Send order” to contact the warehouse.`);
    document.querySelector('#reference').value = `ORDER-${Date.now()}`;
  } catch (error) { showMessage(error.message, true); }
  finally { createButton.disabled = false; }
});

refreshButton.addEventListener('click', async () => {
  try { await refresh(); showMessage('Order statuses refreshed from the Hub database.'); }
  catch (error) { showMessage(error.message, true); }
});
