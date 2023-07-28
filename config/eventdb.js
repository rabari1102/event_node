const mongoose = require("mongoose");

require("dotenv").config();

const dbConnect = () => {
console.log(process.env.DATABASE_URL)
  mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("connection successful");
    })
    .catch((err) => {
      console.log("recived an error");
      console.error(err.message);
      process.exit(1);
    });
};

module.exports = dbConnect;
