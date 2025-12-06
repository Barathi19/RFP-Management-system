const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  console.log(process.env.MONGO_URI);

  if (!uri) {
    throw new ErrorResponse("MONGO_URI does not exist!", 500);
  }

  try {
    await mongoose.connect(uri);
    console.log("Database connected successfully...".magenta);
  } catch (err) {
    console.error(`Database connection failed! Error: ${err.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;
