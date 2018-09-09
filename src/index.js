// Dependencies
const express = require("express");
const dotenv = require("dotenv");

// Initialization
dotenv.config();
const app = express();

// Global consts
const PORT = process.env.PORT || 8080;


// Port listen
app.listen(PORT, function(){
        console.log("Listening on port " + PORT + " :D")
});