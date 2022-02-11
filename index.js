const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

mongoose
  .connect(process.env.mongo)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);

app.listen(process.env.PORT || 5000, () => {
    console.log('server connect sucsessfully');
})