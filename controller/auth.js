const connection = require("../database/db");

// Función para manejar el registro de usuarios
const register = (req, res) => {
    const { nombre, apellido, correo, password, direccion, telefono, rol, fecha_nacimiento } = req.body;

    connection.query(
        "INSERT INTO usuarios SET ?", 
        { Nombre: nombre, Apellido: apellido, Correo: correo, Password: password, Direccion: direccion, Telefono: telefono, Rol: rol, FechaNacimiento: fecha_nacimiento }, 
        (error, results) => {
            if (error) {
                console.error("Error al registrar usuario:", error);
                return res.status(500).send("Error al registrar el usuario.");
            }

            res.render("register", {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro exitoso!",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: "/login"
            });
        }
    );
};

// Función para manejar el inicio de sesión
const login = (req, res) => {
    const { correo, password } = req.body;


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
                alertMessage: "Correo o contraseña incorrecta",
                alertIcon: "error",
                showConfirmButton: true,
                timer: 6000,
                ruta: "login"
            });
        }

        // Si la autenticación es exitosa
        req.session.loggedin = true;
        req.session.nombre = results[0].Nombre;
        req.session.rol = results[0].Rol;
        req.session.idUsuarios = results[0].idUsuarios;

        res.render("login", {
            alert: true,
            alertTitle: "Exitoso",
            alertMessage: "¡Login exitoso!",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: " "
        });
    });
};

// Función para cerrar sesión
const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/"); // Redirige al usuario al inicio
    });
};

//- Auth pages
const renderHomePage = (req, res) => {
    // Comprobar si la sesión existe y si 'loggedin' está definido

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
};


// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
    if (!req.session.idUsuarios) {
        return res.redirect("/login"); // Redirige a la página de inicio de sesión si no está autenticado
    }
    next(); // Si está autenticado, pasa a la siguiente función o ruta
};

module.exports = {
    register,
    login,
    logout,
    renderHomePage,
    verificarAutenticacion
};
