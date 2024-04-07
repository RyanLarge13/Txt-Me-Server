import client from "../../utils/client.js";

const alterTables = async () => {
 try {
  await client.connect();
  const data = await client.query(`
    ALTER TABLE Users
    ADD COLUMN passemailcode VARCHAR(6), 
    ADD COLUMN passEmailExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    ADD COLUMN passEmailUsed BOOLEAN;
    `);
  console.log("Query Executed");
  console.log(data);
  client.end();
 } catch (err) {
  console.log(err);
 } finally {
  console.log("Connection closed");
 }
};

alterTables();
