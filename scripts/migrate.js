import { readConfig } from '../src/config.js';
import { migrate, migrateWarehouse } from '../src/db.js';

try {
  const config = readConfig();
  migrate(config.databasePath);
  migrateWarehouse(config.warehouseDatabasePath);
  console.log('Migrations applied to the Hub and warehouse databases. Existing orders kept.');
} catch (error) {
  console.error(`Migration stopped: ${error.message}`);
  process.exitCode = 1;
}
