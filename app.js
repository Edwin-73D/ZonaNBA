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


//console.log(__dirname);
//- invocamos el modulo de la conexion de la db
const connection = require("./database/db");

//-Estableciendo las rutas

app.get("/login", (req, res)=>{
    res.render("login");
})
app.get("/registro", (req, res)=>{
    res.render("register");
})

//-Registro de usuarios
app.post("/register", async (req, res)=>{
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const correo = req.body.correo;
    const password = req.body.password;
    const direccion = req.body.direccion;
    const telefono = req.body.telefono;
    const rol = req.body.rol;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    connection.query("INSERT INTO usuarios SET ?", {Nombre:nombre, Apellido:apellido, Correo:correo, Password:password, Direccion:direccion, Telefono:telefono, Rol:rol, FechaNacimiento:fecha_nacimiento}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render("register", {
               alert: true,
               alertTitle: "Registro",
               alertMessage:"Registro Exitoso!",
               alertIcon:"Exitoso",
               showConfirmButton:false,
               timer:1500,
               ruta:" " 
            })
        }
    })
})

//-Loguin

app.post("/auth", async (req, res) => {
    const correo = req.body.correo;
    const password = req.body.password;

    if (!correo || !password) {
        return res.status(400).send("Por favor, ingresa correo y contraseña.");
    }

    connection.query("SELECT * FROM usuarios WHERE Correo = ?", [correo], (error, results) => {
        if (error) {
            console.error("Error en la consulta SQL:", error);
            return res.status(500).send("Error en el servidor.");
        }

        // Si no se encuentra el usuario o la contraseña es incorrecta
        if (!results || results.length === 0 || results[0].Password !== password) {
            return res.render("login", {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Correo o Contraseña incorrecta",
                alertIcon: "error",
                showConfirmButton: true,
                timer: 60000,
                ruta: "login"
            });
        }

        // Si la autenticación es exitosa
        req.session.loggedin = true;
        req.session.nombre = results[0].Nombre;
        return res.render("login", {
            alert: true,
            alertTitle: "Exitoso",
            alertMessage: "Login Exitoso!",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: " "
        });
    });
});


//- Auth pages
app.get("/", (req, res) => {
    console.log("Session loggedin: ", req.session.loggedin);  // Verifica el estado de la sesión
    if (req.session.loggedin) {
        res.render("index", {
            login: true,
            nombre: req.session.nombre
        });
    } else {
        res.render("index", {
            login: false,
            nombre: "Login"
        });
    }
});

//Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});



//- establecemos el motor de plantillas
app.set("view engine", "ejs");

//- invocamos a bcrypt.js
const bcryptjs = require("bcryptjs");



app.listen(3000, (req, res) => {
    console.log("server running in http://localhost:3000");
} )