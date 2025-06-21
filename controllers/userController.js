import ResHdlr from "../utils/ResponseHandler.js";
import client from "../utils/client.js";

export const addContact = async (req, res) => {
  const user = req.user;
  const { contact } = req.body;

  if (!user) {
    ResHdlr.authErr(res, "We cannot save this contact until you login");
    return;
  }

  if (!contact) {
    ResHdlr.badReq(res, "Please provide a contact to be saved");
    return;
  }

  /*
    TODO:
      IMPLEMENT:
        1. Don't forget to add validation and verification
  */
  // if (!varifyContact(contact)) {
  // return error
  // }

  let clientCon;
  try {
    clientCon = await client.connect();

    try {
      const newContactInDB = await clientCon.query(
        `
          INSERT INTO Contacts(
            contactId,
            name,
            email,
            number,
            space,
            nickname,
            address,
            website,
            avatar,
            synced,
            userId
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;
        `,
        [
          contact.contactid,
          contact.name,
          contact.email,
          contact.number,
          contact.space || "primary",
          contact.nickname || "",
          contact.address || "",
          contact.website || "",
          contact.avatar || "",
          true,
          user.userId,
        ]
      );

      if (!newContactInDB.rows.length > 0) {
        ResHdlr.srvErr(res, "We could not save your contact right now");
        return;
      }

      ResHdlr.sucCreate(res, "Successfully saved your new contact", {
        newContactInDB,
      });
    } catch (err) {
      console.log(err);
      ResHdlr.qryErr(res, err);
      return;
    }
  } catch (err) {
    console.log(err);
    ResHdlr.conErr(res, err, "addContact");
    return;
  } finally {
    if (clientCon) {
      clientCon.release();
    }
  }
};

export const getAllContacts = async (req, res) => {
  const user = req.user;
  if (!user) {
    return ResHdlr.authErr(res, "We could not access your address book");
  }
  let clientCon;
  try {
    clientCon = await client.connect();
    try {
      const allContacts = await clientCon.query(
        `
     SELECT * FROM contacts 
     WHERE userId = $1
     ORDER BY name ASC;
   `,
        [user.userId]
      );
      return ResHdlr.sucRes(res, "Successfully retrieved contacts", {
        contacts: allContacts.rows,
      });
    } catch (err) {
      console.log(err);
      return ResHdlr.qryErr(res, err);
    }
  } catch (err) {
    console.log(err);
    return ResHdlr.conErr(res, err, "getAllContacts");
  } finally {
    if (clientCon) {
      clientCon.release();
    }
  }
};

export const deleteContact = async (req, res) => {
  const user = req.user;

  if (!user) {
    ResHdlr.srvErr(res, "You are not authorized to delete this contact");
    return;
  }

  const contactid = req.params.contactid;

  /*
    TODO:
      IMPLEMENT:
        1. contactid must be validated right here
  */
  if (!contactid) {
    ResHdlr.badReq(res, "Please select a valid contact to delete");
  }

  let clientCon;

  try {
    clientCon = await client.connect();

    try {
      const query = await clientCon.query(
        `
          DELETE FROM Contacts
          WHERE contactId = $1 AND userId = $2
          RETURNING *;
        `,
        [contactid, user.userId]
      );

      if (query.rows.length < 1) {
        ResHdlr.qryErr(
          res,
          "No contact was found to delete in your address book"
        );
        return;
      }

      ResHdlr.sucRes(res, "Contact removed from your address book", {});
    } catch (err) {
      console.log("Server error deleting contact", err);
    }
  } catch (err) {
    console.log(err);
    ResHdlr.conErr(res, err, "deleteContact");
  } finally {
    if (clientCon) {
      clientCon.release();
    }
  }
};

export const getAllMessages = async (req, res) => {
  const user = req.user;
  if (!user) {
    return ResHdlr.authErr(res, "We could not access your messages");
  }

  let clientCon;

  try {
    clientCon = await client.connect();
    try {
      const allMessages = await clientCon.query(
        `
     SELECT * FROM messages 
     WHERE fromId OR toId = $1;
   `,
        [user.userId]
      );
      ResHdlr.sucRes(res, "Successfully retrieved messages", {
        messages: allMessages.rows,
      });
      return;
    } catch (err) {
      console.log(err);
      ResHdlr.qryErr(res, err);
      return;
    }
  } catch (err) {
    console.log(err);
    ResHdlr.conErr(res, err, "getAllContacts");
    return;
  } finally {
    clientCon.release();
  }
};

export const getConversationByUser = async (req, res) => {
  const user = req.user;
  const otherUserId = req.params.userId;
  if (!user) {
    return ResHdlr.authErr(res, "We could not access your messages");
  }
  if (!otherUserId) {
    return ResHdlr.authErr(res, "You have no messages to or from this person");
  }

  let clientCon;

  try {
    clientCon = await client.connect();
    try {
      const allMessages = await clientCon.query(
        `
     SELECT * FROM messages 
     WHERE fromId = $1 AND toId = $2 or fromId = $2 AND toId = $1;
   `,
        [user.userId, otherUserId]
      );
      return ResHdlr.sucRes(res, "Successfully retrieved messages", {
        messages: allMessages.rows,
      });
    } catch (err) {
      console.log(err);
      return ResHdlr.qryErr(res, err);
    }
  } catch (err) {
    console.log(err);
    return ResHdlr.conErr(res, err, "getAllContacts");
  } finally {
    clientCon.release();
  }
};

export const getAllUserData = async (req, res) => {
  const user = req.user;
  if (!user) {
    return ResHdlr.authErr(
      res,
      "You are not authorized to access this information"
    );
  }
  try {
    // Grab all the data you need after connecting to client. Don't forget to add the client here
  } catch (err) {
    console.log(err);
    return ResHdlr.conErr(res, err, "getAllUserData");
  }
};
