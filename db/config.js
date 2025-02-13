
require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected"))
  .catch(err => console.error("DB Connection Error:", err));

module.exports = mongoose;

