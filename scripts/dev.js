import { readConfig } from '../src/config.js';
import { createHub } from '../src/server.js';
import { createWarehouse } from '../src/warehouse.js';

const running = [];
async function stop() {
  await Promise.all(running.map((app) => app.close()));
}

try {
  const config = readConfig();
  const warehouse = createWarehouse(config);
  const hub = createHub(config);
  running.push(warehouse, hub);
  for (const [app, port] of [[warehouse, config.warehousePort], [hub, config.port]]) {
    await new Promise((resolve, reject) => {
      app.server.once('error', reject);
      app.server.listen(port, config.host, resolve);
    });
  }
  console.log(`Hub: http://${config.host}:${config.port}`);
  console.log(`Warehouse: http://${config.host}:${config.warehousePort} (fictional service)`);
  console.log('Open .env in the editor to find API_KEY. Press Ctrl+C to stop both services.');
  let stopping = false;
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      await stop();
    });
  }
} catch (error) {
  console.error(`Startup stopped: ${error.message}`);
  await stop();
  process.exitCode = 1;
}
