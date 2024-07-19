import client from "../../utils/client.js";

const alterTables = async () => {
  try {
    await client.connect();
    const data = await client.query(`
    ALTER TABLE Contacts
    ADD COLUMN nickname VARCHAR(255),
    ADD COLUMN address VARCHAR(255),
    ADD COLUMN website VARCHAR(255),
    ADD COLUMN avatar VARCHAR(255);
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
