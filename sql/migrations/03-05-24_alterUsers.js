import client from "../../utils/client.js";

const alterTables = async () => {
 try {
  await client.connect();
  const data = await client.query(`
    ALTER TABLE Users
    DROP COLUMN phoneNumber
    ADD COLUMN phoneNumber VARCHAR(10) NOT NULL;
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
