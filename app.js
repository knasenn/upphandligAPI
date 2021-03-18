// https://github.com/knasenn/upphandlingAPI
// https://github.com/wiur83/exjobb-komo

// Fixa så att JsonWebToken funkar (backend?)
// const verify = require("../models/verifyToken");
// https://github.com/wiur83/exjobb-komo/blob/master/controllers/voice.js

// **** Fixa så .env har token i sig
// Lägg till gitignore (bla .env)
// Kör MVC modellen
// och kör module.export

//Importing modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require("body-parser")
const dotenv = require("dotenv");

//Variables
const port = 8333;
const app = express();
const verify = require("./models/verifyToken");

//Importing controllers
const authRoute = require("./controllers/auth");

//Config
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
      console.log("connected to db");
  }
});


//Index GET
app.get("/", (req, res) => {
    res.send("hello /");
});


app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API'
  });
});

//Middleware
app.use("/user", authRoute);

app.listen(port, () => console.log(`the server is running on port ${port}`));
