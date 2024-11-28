// controllers/carrito.js
const connection = require('../database/db');

// Ruta para mostrar el carrito
exports.mostrarCarrito = (req, res) => {
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
};

// Ruta para agregar un producto al carrito
exports.agregarAlCarrito = (req, res) => {
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
};

// Ruta para eliminar un producto del carrito
exports.eliminarDelCarrito = (req, res) => {
    const { producto_id } = req.params; // Tomamos el producto_id desde la URL
    const userId = req.session.idUsuarios; // ID del usuario desde la sesión

    connection.query(
        `DELETE FROM carrito WHERE user_id = ? AND producto_id = ?`,
        [userId, producto_id],
        (error) => {
            if (error) {
                console.error("Error al eliminar del carrito:", error);
                res.status(500).send("Error al eliminar del carrito.");
            } else {
                res.redirect("/carrito"); // Redirigimos al carrito después de eliminar el producto
            }
        }
    );
};
