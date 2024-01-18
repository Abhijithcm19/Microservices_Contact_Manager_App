const express = require("express");
const { connectDb } = require("./database");
const { errorHandler } = require("./util/middleware");
const { PORT } = require("./config");
const userRoutes = require("./routes/userRoutes");

const initializeServer = async () => {
  await connectDb();
  const app = express();

  app.use(express.json());
  app.use(userRoutes);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initializeServer();
