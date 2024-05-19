const mongoose = require("mongoose");

const mongoDB = 'mongodb+srv://adminrdm:C2cC2VvHIH5OnOmU@recetasdelmundo.yra2lh0.mongodb.net/RecetasDelMundo';

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDB;
