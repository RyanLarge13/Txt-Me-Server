import client from "../../utils/client.js";

const alterTables = async () => {
 try {
  await client.connect();
  const data = await client.query(`
    ALTER TABLE Users
    ADD COLUMN verifiedPhone BOOLEAN NOT NULL DEFAULT false, 
    ADD COLUMN verifiedEmail BOOLEAN NOT NULL DEFAULT false;
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
