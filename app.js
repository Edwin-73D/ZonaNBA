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








// Ruta para mostrar el carrito
/* app.get("/carrito", verificarAutenticacion, (req, res) => {
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
     */
//});

// Ruta para agregar un producto al carrito
/* app.post("/carrito/agregar", verificarAutenticacion, (req, res) => {
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
}); */


// Ruta para eliminar un producto del carrito
// Ruta para eliminar un producto del carrito
/* app.post("/carrito/eliminar/:producto_id", verificarAutenticacion, (req, res) => {
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
}); */



//- establecemos el motor de plantillas
app.set("view engine", "ejs");




app.listen(3000, (req, res) => {
    console.log("server running in http://localhost:3000");
} )