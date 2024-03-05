class ResponseHandler {
 srvErr(res, message) {
  return res.status(500).json({ message: message });
 }
 badReq(res, message) {
  return res.status(400).json({ message: message });
 }
 authErr(res, message) {
  return res.status(401).json({ message: message });
 }
 notFoundErr(res, message) {
  return res.status(404).json({ message: message });
 }
 sucRes(res, message, data) {
  return res.status(200).json({ message: message, data: data });
 }
 sucCreate(res, message, data) {
  return res.status(201).json({ message: message, data: data });
 }
 conErr(res, err, controllerMethod) {
  console.error(
   `Error with pool connection when calling userController.${controllerMethod}: ${err}`
  );
  return this.srvErr(
   res,
   "There was an issue connecting to the db. Please try to refresh the page and attempt to login again"
  );
 }
 qryErr(res, err) {
  console.error("Error executing query:", err);
  if (err instanceof SyntaxError) {
   return this.srvErr(res, "Syntax error in SQL query");
  } else if (err.code === "ECONNREFUSED") {
   return this.srvErr(res, "Connection to the database refused");
  } else {
   return this.srvErr(res, "Internal server error");
  }
 }
}

const ResHdlr = new ResponseHandler();

export default ResHdlr;
