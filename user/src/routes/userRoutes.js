const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  userProfile,
  userFavourite,appEvents
} = require("../controllers/userController");

const {validateToken} = require("../util/middleware");


const router = express.Router();

router.use("/app-event",appEvents)

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.get("/profile",validateToken,userProfile)

router.get("/favourite",validateToken,userFavourite)


module.exports = router;
