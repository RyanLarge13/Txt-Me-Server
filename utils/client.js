import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;
dotenv.config();

const host = process.env.PGHOST;
const database = process.env.PGDB;
const user = process.env.PGUSER;
const password = process.env.PGPASS;

const client = new Pool({
  host,
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false },
});

export default client;
