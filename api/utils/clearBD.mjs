import 'dotenv/config';
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido por Render
  },
});

await client.connect();

await client.query("DROP SCHEMA public CASCADE;");
await client.query("CREATE SCHEMA public;");

await client.end();

console.log("Base de datos limpiada correctamente");