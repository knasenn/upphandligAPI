const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    console.log("verify1");
    console.log(req.headers.token);
    console.log("verify2");

    const token = req.headers.token;
    if (!token) {
        req.user = "Access denied";
        next();
    }
    try {
        console.log("hulalaluba");
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(verified);
        console.log("hulalaluba2");
        req.user = verified;
        next();
    } catch (err) {
        req.user = "Invalid token";
        next();
    }
}
