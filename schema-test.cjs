const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
if (!dbUrlMatch) { console.error('No DB URL'); process.exit(1); }
const { Client } = require('pg');
const client = new Client({ connectionString: dbUrlMatch[1].trim() });
client.connect().then(() => {
  return client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'addresses';");
}).then(res => {
  console.log(res.rows);
  return client.end();
}).catch(console.error);
