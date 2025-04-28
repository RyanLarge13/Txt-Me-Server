import ResHdlr from "../utils/ResponseHandler.js";
// import Valdtr from "../utils/Validator.js";
import client from "../utils/client.js";

export const getMessages = async (req, res) => {
  const user = req.user;

  if (!user) {
    ResHdlr.authErr(
      res,
      "You are not authorized to make this request. Please login and try again"
    );
  }

  let clientConnection;

  try {
    clientConnection = await client.connect();

    try {
      const messages = await clientConnection.query(
        `
            SELECT * FROM messages
            WHERE fromId OR toId = $1
            ORDER BY sentAt ASC;
        `,
        [user.userId]
      );

      const rows = messages.rows || [];

      ResHdlr.sucRes(res, "Messages successfully fetched", rows);
    } catch (err) {
      console.log(`Error calling query inside getMessages. Error: ${err}`);
      ResHdlr.qryErr(res, err);
    }
  } catch (err) {
    console.log(
      `Error connecting to DB client inside getMessages. Error: ${err}`
    );
    ResHdlr.conErr(res, err, "getMessages");
  } finally {
    clientConnection.release();
  }
};
