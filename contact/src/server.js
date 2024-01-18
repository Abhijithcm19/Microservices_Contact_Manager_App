const express = require("express");
const { connectDb } = require("./database");
const { errorHandler } = require("./util/middleware");
const { PORT } = require("./config");
const contactRoutes = require("./routes/contactRoutes");

const initializeServer = async () => {
  await connectDb();
  const app = express();

  app.use(express.json());
  app.use(contactRoutes);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initializeServer();
