const dotEnv = require("dotenv");
require("dotenv").config();

if (process.env.NODE_ENV !== "prod") {
  const envFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: envFile });
} else {
  dotEnv.config();
}


  module.exports = {
    PORT: process.env.PORT,
    CONNECTION_STRING: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    USER_BINDING_KEY: process.env.USER_BINDING_KEY,
    QUEUE_NAME: process.env.QUEUE_NAME,
   
  };
     