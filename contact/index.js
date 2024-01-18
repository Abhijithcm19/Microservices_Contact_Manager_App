const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  return res.status(200).json("I am from contact service");
});

app.listen(8001, () => {
  console.log("contact service is listening to port 8001");
});
