import client from "../../utils/client.js";

const alterTables = async () => {
 try {
  await client.connect();
  const data = await client.query(`
    ALTER TABLE Users
    ADD COLUMN passcode VARCHAR(6), 
    ADD COLUMN passExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    ADD COLUMN passUsed BOOLEAN;
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
