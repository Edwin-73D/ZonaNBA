const express = require("express");
const app = express();

app.use(express.urlencoded({extended:false}))
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config({path:"./env/.env"})

app.use(express.static("public"));

app.use("/", require("./router"));

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






//-Registro de productos

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
        req.session.rol = results[0].Rol;
        req.session.idUsuarios = results[0].idUsuarios;
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
    console.log("Session loggedin: ", req.session.loggedin); // Verifica el estado de la sesión

    // Consulta los productos de la base de datos
    connection.query("SELECT * FROM productos", (error, results) => {
        if (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).send("Error interno del servidor");
        }

        // Renderiza la vista index con la información de sesión y productos
        res.render("index", {
            login: req.session.loggedin || false,
            nombre: req.session.loggedin ? req.session.nombre : "Login",
            rol: req.session.loggedin ? req.session.rol : null,
            results: results // Pasamos los productos a la vista
        });
    });
});


//Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});

// Middleware para verificar que el usuario esté autenticado
const verificarAutenticacion = (req, res, next) => {
    if (!req.session.idUsuarios) {
        return res.redirect("/login"); // Redirige a la página de inicio de sesión si no está autenticado
    }
    next();
};

// Ruta para mostrar el carrito
app.get("/carrito", verificarAutenticacion, (req, res) => {
    const userId = req.session.idUsuarios;

    if (!userId) {
        console.error("El ID del usuario no está definido en la sesión.");
        return res.status(400).send("Usuario no autenticado.");
    }

    connection.query(
        `
        SELECT p.idProducto AS producto_id, p.Nombre AS nombreProducto, p.Precio, c.cantidad, p.Img
        FROM carrito c
        JOIN productos p ON c.producto_id = p.idProducto
        WHERE c.user_id = ?
        `,
        [userId],
        (error, results) => {
            if (error) {
                console.error("Error al obtener el carrito:", error);
                return res.status(500).send("Error al mostrar el carrito.");
            }
    
            res.render("carrito", { carrito: results });
        }
    );
    
});

// Ruta para agregar un producto al carrito
app.post("/carrito/agregar", verificarAutenticacion, (req, res) => {
    const { producto_id } = req.body;
    const userId = req.session.idUsuarios;

    if (!userId) {
        console.error("El ID del usuario no está definido en la sesión.");
        return res.status(400).send("Usuario no autenticado.");
    }

    // Verificar si el producto ya existe en el carrito del usuario
    connection.query(
        `SELECT cantidad FROM carrito WHERE user_id = ? AND producto_id = ?`,
        [userId, producto_id],
        (error, results) => {
            if (error) {
                console.error("Error al verificar el carrito:", error);
                return res.status(500).send("Error al verificar el carrito.");
            }

            if (results.length > 0) {
                // Si el producto ya existe, incrementar la cantidad
                const nuevaCantidad = results[0].cantidad + 1;
                connection.query(
                    `UPDATE carrito SET cantidad = ? WHERE user_id = ? AND producto_id = ?`,
                    [nuevaCantidad, userId, producto_id],
                    (updateError) => {
                        if (updateError) {
                            console.error("Error al actualizar el carrito:", updateError);
                            return res.status(500).send("Error al actualizar el carrito.");
                        }
                        res.redirect("/carrito");
                    }
                );
            } else {
                // Si el producto no existe, insertarlo con cantidad = 1
                connection.query(
                    `INSERT INTO carrito (user_id, producto_id, cantidad) VALUES (?, ?, ?)`,
                    [userId, producto_id, 1],
                    (insertError) => {
                        if (insertError) {
                            console.error("Error al agregar al carrito:", insertError);
                            return res.status(500).send("Error al agregar al carrito.");
                        }
                        res.redirect("/carrito");
                    }
                );
            }
        }
    );
});


// Ruta para eliminar un producto del carrito
// Ruta para eliminar un producto del carrito
app.post("/carrito/eliminar/:producto_id", verificarAutenticacion, (req, res) => {
    const { producto_id } = req.params; // Tomamos el producto_id desde la URL
    const userId = req.session.idUsuarios; // ID del usuario desde la sesión

    connection.query(
        `DELETE FROM carrito WHERE user_id = ? AND producto_id = ?`, // Consulta SQL
        [userId, producto_id], // Los parámetros de la consulta
        (error) => {
            if (error) {
                console.error("Error al eliminar del carrito:", error); // Si ocurre un error, lo mostramos
                res.status(500).send("Error al eliminar del carrito.");
            } else {
                res.redirect("/carrito"); // Redirigimos al carrito después de eliminar el producto
            }
        }
    );
});



//- establecemos el motor de plantillas
app.set("view engine", "ejs");




app.listen(3000, (req, res) => {
    console.log("server running in http://localhost:3000");
} )