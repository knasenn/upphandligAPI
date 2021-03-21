const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    console.log("here");
    console.log(req.headers.token);
    console.log("here2");

    const token = req.headers.token;
    if (!token) {
        req.user = "Access denied";
        next();
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        req.user = "Invalid token";
        next();
    }
}
