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
    //res.render("login");
})
app.get("/registro", (req, res)=>{
    res.render("register");
})
app.get("/admin", (req, res)=>{
    res.render("admin");
})
app.get("/eliminarProducto", (req, res) => {
    res.render("eliminarProducto");  
});
app.get("/modificarProducto", (req, res) => {
    res.render("modificarProducto");  
});









//-Registro de productos
app.post("/admin", async (req, res)=>{
    const nombre = req.body.nombre;
    const equipo = req.body.equipo;
    const talla = req.body.talla;
    const precio = req.body.precio;
    const stock = req.body.stock;
    const descripcion = req.body.descripcion;
    const img = req.body.img;
    const codigo = req.body.codigo;
    connection.query("INSERT INTO productos SET ?", {Nombre:nombre, Equipo:equipo, Talla:talla, Precio:precio, Stock:stock, Descripcion:descripcion, Img:img, Codigo:codigo}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render("admin", {
                alert: true,
                alertTitle: "Registro",
                alertMessage:"Registro Exitoso!",
                alertIcon:"Exitoso",
                showConfirmButton:false,
                timer:1500,
                ruta:"admin" 
             })
        }
    })
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

//-tabla de productos
app.get("/productos", (req, res) => {
    const query = "SELECT * FROM productos";
    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).send("Error al cargar los productos");
        } else {
            res.render("productos", { productos: results }); // Renderiza la vista EJS con los datos
        }
    });
});

//-eliminar Productos
// Ruta POST para procesar la eliminación del producto
app.post("/eliminarProducto", (req, res) => {
    const { idProducto } = req.body;  // Recibe el ID del producto desde el formulario

    // Consulta SQL para eliminar el producto con el ID proporcionado
    const query = "DELETE FROM productos WHERE idProducto = ?";

    connection.query(query, [idProducto], (error, results) => {
        if (error) {
            console.log("Error al eliminar el producto:", error);

            
        } else {
            if (results.affectedRows > 0) {
                res.render("eliminarProducto", {
                    alert: true,
                    alertTitle: "Eliminado",
                    alertMessage:"Eliminacion Exitosa!",
                    alertIcon:"Exitoso",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:"productos" 
                 })
            } else {
                    res.render("eliminarProducto", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage:"No se pudo Eliminar!",
                        alertIcon:"Fail",
                        showConfirmButton:false,
                        timer:1500,
                        ruta:"eliminarProducto" 
                     })
            }
        }
    });
});

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