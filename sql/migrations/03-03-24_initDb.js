import client from "../../utils/client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// For Linux comment out above code and un-comment out below code
// const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const initDb = async () => {
  try {
    const file = "../createTables.sql";
    const queries = fs.readFileSync(path.join(__dirname, file), "utf-8");
    await client.connect();
    const data = await client.query(queries);
    console.log("Query Executed");
    console.log(data);
    client.end();
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Connection closed");
  }
};

initDb();
