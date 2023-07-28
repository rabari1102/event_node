const bodyParser = require("body-parser");
const router = require("./router/eventrouter");
const express = require('express');
const mongoose = require('mongoose');
const dbConnect = require("./config/eventdb");
const app = express();
app.use(bodyParser.json());

app.use("/api/event", router);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server started at port at ${PORT}`);
});

  dbConnect();