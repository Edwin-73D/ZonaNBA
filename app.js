const express = require("express");
const app = express();

app.use(express.urlencoded({extended:false}))
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config({path:"./env/.env"})

app.use(express.static("public"));

//-var sesion
const session = require("express-session");
app.use(session ({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))

app.use("/", require("./router"));



//- establecemos el motor de plantillas
app.set("view engine", "ejs");




app.listen(3000, (req, res) => {
    console.log("server running in http://localhost:3000");
} )