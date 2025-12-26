const mongoose = require("mongoose");
const logger = require("../utils/logger");

const initializeDatabase = () => {
  mongoose.connect(process.env.MONGODB_URI, {});

  const db = mongoose.connection;

  db.on("error", (error) => {
    logger.error("Error connecting to the database:", { error: error.message, stack: error.stack });
    process.exit(1);
  });
  
  db.once("open", () => {
    console.log("Connected to the database");
  });
};

module.exports = { initializeDatabase };
