const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  addFavouriteContact,
  removeFavouriteContact,
  // appEvents
} = require("../controllers/contactController");
const { validateToken } = require("../util/middleware");

// router.use("/app-events", appEvents);
router.use(validateToken);
router.put("/favourite", addFavouriteContact);
router.delete("/favourite/:id", removeFavouriteContact);
router.route("/").get(getContacts).post(createContact);
router.route("/:id").get(getContact).put(updateContact).delete(deleteContact);

module.exports = router;
