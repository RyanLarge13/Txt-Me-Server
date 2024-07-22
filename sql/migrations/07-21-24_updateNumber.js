import client from "../../utils/client.js";

const alterTables = async () => {
  try {
    const clientCon = await client.connect();
    const data = await clientCon.query(`
    ALTER TABLE Contacts
    DROP COLUMN number,
    ADD COLUMN number VARCHAR(15) NOT NULL UNIQUE;

    ALTER TABLE Users
    DROP COLUMN phoneNumber,
    ADD COLUMN phoneNumber VARCHAR(15) NOT NULL UNIQUE
    `);
    console.log("Query Executed");
    console.log(data);
    clientCon.release();
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Connection closed");
  }
};

alterTables();
