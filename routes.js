require("dotenv").config();
const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const rimraf = require("rimraf");
// models
const User = require("./models/AdminUser");

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é inválido!" });
  }
}
// Register
// routes.post("/auth/register", async (req, res) => {
//   const { name, email, password, confirmpassword } = req.body;

//   // validations
//   if (!name) {
//     return res.status(422).json({ msg: "O nome é obrigatório!" });
//   } else if (!email) {
//     return res.status(422).json({ msg: "O email é obrigatório!" });
//   } else if (!password) {
//     return res.status(422).json({ msg: "A senha é obrigatória!" });
//   } else if (password != confirmpassword) {
//     return res
//       .status(422)
//       .json({ msg: "A senha e a confirmação precisam ser iguais!" });
//   }

//   // check if user exists
//   const userExists = await User.findOne({ email: email });

//   if (userExists) {
//     return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
//   }

//   // create password
//   const salt = await bcrypt.genSalt(12);
//   const passwordHash = await bcrypt.hash(password, salt);

//   // create user
//   const user = new User({
//     name,
//     email,
//     password: passwordHash,
//   });

//   try {
//     await user.save();

//     res
//       .status(201)
//       .json({ msg: "Usuário criado com sucesso!", userCriado: true });
//   } catch (error) {
//     res.status(500).json({ msg: error });
//   }
// });

routes.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // check if user exists
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    const currentUser = await User.findById(user._id, "-password");

    res
      .status(200)
      .json({ currentUser, msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// Delete file
routes.delete("/deletar/:file", checkToken, (req, res) => {
  const file = req.params.file;
  const filePAth = `${__dirname}/public/ftp/${file}`;
  fs.unlink(filePAth, (err) => {
    if (err) res.json({ msg: `erro ao deletar arquivo ${file}`, err });
    return res.json({ msg: `arquivo ${file} deletado com sucesso` });
  });
});

//Create a new dir
routes.post("/createNewDir/:dirname", checkToken, (req, res) => {
  const dir = req.params.dirname;
  const dirPath = `${__dirname}/public/ftp/${dir}`;

  //Verifica se não existe
  if (!fs.existsSync(dirPath)) {
    //Efetua a criação do diretório
    fs.mkdir(dirPath, (err) => {
      if (err) {
        res.json({ msg: "hum algo deu errado! :(", err });
        return;
      }

      res.json({ msg: `Diretório ${dir} criado! =)` });
    });
  } else {
    res.json({ msg: `O Diretorio ${dir} ja existe!` });
  }
});

// Delete a Dir
routes.delete("/deleteDir/:dirname", checkToken, (req, res) => {
  const dir = req.params.dirname;
  const dirPath = `${__dirname}/public/ftp/${dir}`;

  if (!fs.existsSync(dirPath)) {
    res.json({ msg: `O diretorio não existe!` });
  } else {
    rimraf(dirPath, function (err) {
      if (err) res.json({ msg: `erro ao deletar Diretorio`, err });
      return res.json({ msg: `Diretorio  deletado com sucesso` });
    });
  }
});


// Upload file
routes.post(
  "/postAudio",
  checkToken,
  multer(multerConfig).single("file"),
  async (req, res) => {
    const { originalname: name, size, filename: key } = req.file;
    return res.json({ msg: `Arquivo ${name} salvo com sucesso` });
  }
);

module.exports = routes;
