const express = require("express");
const serveIndex = require("serve-index");

const app = express();

const cors = require("cors");

app.use(
  "/ftp",
  express.static("public/ftp"),
  serveIndex("public/ftp", { icons: true })
);

app.use(express.json());
// cors config
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  app.use(cors());
  next();
});

const port = process.env.PORT || 8081
app.use(require("./routes.js"));
app.listen(port, () => console.log(`Server is running on port: ${port}`));
