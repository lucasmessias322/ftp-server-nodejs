const routes = require("express").Router();

const multer = require("multer");
const multerConfig = require("./config/multer");

routes.post(
  "/postFile",
  multer(multerConfig).single("file"),
  async (req, res) => {
    const { originalname: name, size, filename: key } = req.file;
    return res.json({ msg: `Arquivo ${name} salvo com sucesso` });
  }
);

module.exports = routes;
