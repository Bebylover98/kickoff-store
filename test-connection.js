const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DIRECT_URL });
client.connect()
  .then(() => { console.log('CONNECTED'); return client.end(); })
  .then(() => process.exit(0))
  .catch(err => { console.error('FAILED:', err.message); process.exit(1); });