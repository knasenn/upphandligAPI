const express = require("express");
const app = express();


//VARIABLES
const port = 3000;


//MIDDLEWARE
app.use("/middleware", (req,res,next) => {
  console.log("middleware test successful");
  next();
});

//ROUTES
app.get("/middleware", (req,res) => {
  res.send("we are on middleware");
});

app.get("/", (req,res) => {
  res.send("we are on home");
});






app.listen(port, () => console.log(`the server is running on port ${port}`));
