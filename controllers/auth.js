const express = require('express');
const router = require('express').Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require('sqlite3').verbose();
// const fetch = require("node-fetch");

const { registerValidation, loginValidation } = require("../models/validation");
// const url_adress = "http://localhost:8333";


//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

// //Static files - KANSKE BEHÅLLA????????????
// router.use("/", express.static("assets"));






// //register POST
// router.post("/register", async (req, res) => {
//     try {
//         await fetch(`${url_adress}/user/register-push`, {
//             method: 'post',
//             headers: {
//                 'Accept': 'application/json, text/plain, */*',
//                 'Content-type': 'application/json'
//             },
//             body: JSON.stringify({
//                 name: req.body.name,
//                 email: req.body.email,
//                 password: req.body.password
//             })
//             }).then(function (response) {
//                 return response.json();
//             })
//             .then(function (result) {
//                 if (result.msg == "error") {
//                     res.render("../views/error.ejs", { msg: result.text });
//                 } else if (result.msg == "success") {
//                     res.redirect('./login');
//                 } else {
//                     res.render("../views/error.ejs", { msg: "Something went wrong" });
//                 }
//             })
//     } catch(err) {
//           console.log(err);
//           res.status(400).send(err);
//     }
// });

//register-create POST
router.post("/register", async (req, res) => {

    //Validation
    const { error } = registerValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

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

// //login GET
// router.get("/login", (req, res) => {
//     //Renders the login view
//     res.render("../views/login.ejs");
// });
// //login POST
// router.post("/login", async (req, res) => {
//     //Login info is checked if OK
//     try {
//         await fetch(`${url_adress}/user/login-push`, {
//             method: 'post',
//             headers: {
//                 'Accept': 'application/json, text/plain, */*',
//                 'Content-type': 'application/json'
//             },
//             body: JSON.stringify({
//               email: req.body.email,
//               password: req.body.password
//             })
//             }).then(function (response) {
//                 return response.json();
//             })
//             .then(async function (result) {
//                 if (result.msg == "error") {
//                     //The user was not logged in and error page is rendered
//                     res.render("error.ejs", { msg: result.text });
//                 } else if (result.msg == "token") {
//                     //The user is logged in
//
//                     //Token and user ID is stored in memory
//                     global.globalToken = result.text;
//                     global.userBackupId = result.backup_id;
//
//                     //Words are imported from words-table in DB and stored
//                     //in memory
//                     global.words = await VoiceMethods.getWords();
//
//                     //List with words are stored in data-table together
//                     //with user ID
//                     //This only happens if new user or new words are added
//                     //in words-table
//                     await VoiceMethods.setUserWords();
//
//                     res.redirect('../voice/start');
//                 } else {
//                     //The user was not logged in and error page is rendered
//                     res.render("error.ejs", { msg: "Something went wrong" });
//                 }
//
//             })
//     } catch(err) {
//           console.log(err);
//           res.render("error.ejs", {msg: "Something went wrong"});
//     }
// });






//login-push POST
router.post("/login", async (req, res) => {
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
