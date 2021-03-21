const express = require('express');
const router = require('express').Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require('sqlite3').verbose();
const fetch = require("node-fetch");

const { registerValidation, loginValidation, addValidation } = require("../models/validation");
const verify = require("../models/verifyToken");
const url_adress = "http://localhost:8333";


//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

//talk-login GET
router.get("/test", async (req, res) => {
      console.log(req.headers.token);
      token = req.headers.token;
      try {
          await fetch(`${url_adress}/prod/test2`, {
              method: 'GET',
              mode: 'no-cors',
              headers: { "token": token }
              })
      } catch(err) {
            console.log(err);
            res.status(400).send(err);
      }
});



//talk-login GET
router.get("/test2", verify, async (req, res) => {
    if (req.user == "Invalid token") {
        console.log("fel");
    } else {
        console.log("succ");
    }


    res.json({ msg: "testzz" });
});







//---------------------
router.post("/add", verify, async (req, res) => {

    //Validation
    const { error } = addValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Kolla att TOKEN OK. Om inte return error.



    //Random ID generated
    let random_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


    //Check if email exist
    db.each("SELECT COUNT(*) AS total FROM users WHERE email LIKE ?",
    req.body.email,(err, row) => {
        if (row.total == 1) {
            //Email exists
        	return res.json({ msg: "error", text: "Email already exists" });
        } else {
            //Email does not exists
            db.run("INSERT INTO users (name, email, password, backup_id) VALUES (?, ?, ?, ?)",
				req.body.name, req.body.email, hashedPassword, random_id, (err) => {
				if (err) {
					res.json({ msg: "error", text: "Something went wrong while writing to database." });
				} else {
                    res.json({ msg: "success" });
                }
		    });
        }
    });
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
