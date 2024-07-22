import client from "../../utils/client.js";

const alterTables = async () => {
  try {
    const clientCon = await client.connect();
    const data = await clientCon.query(`
      ALTER TABLE Messages
      ADD COLUMN fromNumber VARCHAR(15) NOT NULL,
      ADD COLUMN toNumber VARCHAR(15) NOT NULL
    `);
    const newData = await clientCon.query(`
      ALTER TABLE Messages
      ADD CONSTRAINT fk_fromNumber FOREIGN KEY (fromNumber) REFERENCES Users(phoneNumber),
      ADD CONSTRAINT fk_toNumber FOREIGN KEY (toNumber) REFERENCES Users(phoneNumber)
    `);
    console.log("Queries Executed");
    console.log(data, newData);
    clientCon.release();
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Connection closed");
  }
};

alterTables();
