require("dotenv").config();
const express = require("express");
const serveIndex = require("serve-index");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

// Config JSON response
app.use(express.json());

// cors config
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST");
  app.use(cors());
  next();
});

app.use(
  "/ftp",
  express.static("public/ftp"),
  serveIndex("public/ftp", { icons: true })
);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const port = process.env.PORT || 8081;
app.use(require("./routes.js"));

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.yhjpk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
  .then(() => {
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`Server is running on port: ${port}`));
