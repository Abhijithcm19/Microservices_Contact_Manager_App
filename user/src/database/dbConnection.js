const mongoose = require("mongoose");


const { CONNECTION_STRING } = require("../config");

const connectDb = async () => {

  try {
    const appSecret = process.env.JWT_SECRET;

    const con = await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
    process.exit(1);
  }
};

module.exports = connectDb;