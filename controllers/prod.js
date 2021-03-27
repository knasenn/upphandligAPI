const express = require('express');
const router = require('express').Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require('sqlite3').verbose();
const fetch = require("node-fetch");

const { registerValidation, loginValidation, addValidation } = require("../models/validation");
const verify = require("../models/verifyToken");
const SearchMethods = require('../models/search');

const url_adress = "http://localhost:8333";


//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
      console.error(err.message);
  }
});

//TEST GET FRONTEND ----------------------------------
router.get("/test", async (req, res) => {
      console.log(req.headers.token);
      token = req.headers.token;
      try {
          await fetch(`${url_adress}/prod/test-get`, {
              method: 'GET',
              mode: 'no-cors',
              headers: { "token": token }
              }).then(function (response) {
                  return response.json();
              }).then(function (result) {
                  res.json(result);
              })
      } catch(err) {
            console.log(err);
            res.status(400).send(err);
      }
});

//TEST verify login GET
router.get("/test-get", verify, async (req, res) => {
    console.log("here YO!");
    console.log(req.user);
    if (req.user == "Invalid token" || req.user == "Access denied") {
        res.json({ msg: req.user });
    }
    if (req.user.hasOwnProperty('id')) {
        res.json({ msg: "success" });
    } else {
        res.json({ msg: "error" });
    }
});







//---------------------
router.post("/search", verify, async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    //Validation
    // const { error } = addValidation(req.body);
    // if (error) return res.json({ msg: "error", text: error.details[0].message });





    //Skicka in typ med header eller body.
    let type = "gnss";

    if (req.user == "Invalid token" || req.user == "Access denied") {
        res.json({ msg: req.user });
    }
    if (req.user.hasOwnProperty('id')) {
        //get info from database
        if (type == "gnss") {
            let gnss = await SearchMethods.getGnss();
            //Filterar ut rätt
            res.json(gnss);
        }
        if (type == "totalstation") {
            let total = await SearchMethods.getTodde();
            //Filterar ut rätt
            res.json(total);
        }
        if (type == "laserskanner") {
            let skanner = await SearchMethods.getLaser();
            //Filterar ut rätt
            res.json(skanner);
        }
    } else {
        res.json({ msg: "error" });
    }



});



//---------------------
router.post("/edit", async (req, res) => {
    //Validation email and password
    const { error } = loginValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Check if email exist
    db.each("SELECT COUNT(*) AS total FROM users WHERE email LIKE ?",
    req.body.email, async (err, row) => {
        if (row.total == 0) {
            //Email not exists
            res.json({ msg: "error", text: "Email not found" });
        } else {
            //email exist
            db.each("SELECT * FROM users WHERE email LIKE ?",
            req.body.email, async (err, row) => {
                if (err) {
                    //Err
                	return res.json({ msg: "error", text: "Something went wrong" });
                } else {
                    //Check if password is correct
                    const validPass = await bcrypt.compare(req.body.password, row.password);
                    if (!validPass) return res.json({ msg: "error", text: "Wrong password!!" });
                    const token = jwt.sign({id: row.backup_id}, process.env.TOKEN_SECRET);
                    res.json({ msg: "token", text: token, backup_id: row.backup_id });
                }
            });
        }
    });
});


//---------------------
router.post("/remove", async (req, res) => {
    //Validation email and password
    const { error } = loginValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Check if email exist
    db.each("SELECT COUNT(*) AS total FROM users WHERE email LIKE ?",
    req.body.email, async (err, row) => {
        if (row.total == 0) {
            //Email not exists
            res.json({ msg: "error", text: "Email not found" });
        } else {
            //email exist
            db.each("SELECT * FROM users WHERE email LIKE ?",
            req.body.email, async (err, row) => {
                if (err) {
                    //Err
                	return res.json({ msg: "error", text: "Something went wrong" });
                } else {
                    //Check if password is correct
                    const validPass = await bcrypt.compare(req.body.password, row.password);
                    if (!validPass) return res.json({ msg: "error", text: "Wrong password!!" });
                    const token = jwt.sign({id: row.backup_id}, process.env.TOKEN_SECRET);
                    res.json({ msg: "token", text: token, backup_id: row.backup_id });
                }
            });
        }
    });
});











module.exports = router;
