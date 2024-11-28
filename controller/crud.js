const connection = require("../database/db");

exports.save = (req, res)=>{
    const nombre = req.body.nombre;
    const equipo = req.body.equipo;
    const talla = req.body.talla;
    const precio = req.body.precio;
    const stock = req.body.stock;
    const descripcion = req.body.descripcion;
    const img = req.body.img;
    const codigo = req.body.codigo;
    connection.query("INSERT INTO productos SET ?", {Nombre:nombre, Equipo:equipo, Talla:talla, Precio:precio, Stock:stock, Descripcion:descripcion, Img:img, Codigo:codigo}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect("/admin");
        }
    })
}

exports.update = (req, res)=>{
    const idProducto = req.body.idProducto;
    const nombre = req.body.nombre;
    const equipo = req.body.equipo;
    const talla = req.body.talla;
    const precio = req.body.precio;
    const stock = req.body.stock;
    const descripcion = req.body.descripcion;
    const img = req.body.img;
    const codigo = req.body.codigo;
    connection.query("UPDATE productos SET ? WHERE idProducto = ?", [{Nombre:nombre, Equipo:equipo, Talla:talla, Precio:precio, Stock:stock, Descripcion:descripcion, Img:img, Codigo:codigo}, idProducto], (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect("/admin");
        }
    })
}

exports.getProductDetails = (req, res) => {
    const idProducto = req.params.idProducto; // Obtener el idProducto de la URL
    connection.query("SELECT * FROM productos WHERE idProducto = ?", [idProducto], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error en la consulta.");
        }
        if (results.length > 0) {
            // Si el producto existe, lo pasamos a la vista
            res.render('product', { producto: results[0] });
        } else {
            // Si no se encuentra el producto, mostramos un error
            res.status(404).send("Producto no encontrado");
        }
    });
};

exports.deleteProduct = (req, res) => {
    const idProducto = req.params.idProducto; // Obtener el idProducto de la URL
    connection.query('DELETE FROM productos WHERE idProducto = ?', [idProducto], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error al eliminar el producto.");
        } else {
            res.redirect('/admin'); // Redirige al admin después de eliminar
        }
    });
};

exports.editProduct = (req, res) => {
    const idProducto = req.params.idProducto; // Obtener el idProducto de la URL

    // Realizamos la consulta para obtener el producto
    connection.query('SELECT * FROM productos WHERE idProducto = ?', [idProducto], (error, results) => {
        if (error) {
            console.log(error);  // Si hay un error, lo mostramos
            return res.status(500).send("Error al obtener el producto.");
        }

        // Si encontramos el producto, renderizamos la vista 'edit.ejs'
        if (results.length > 0) {
            res.render('edit', { productos: results[0] });
        } else {
            // Si no encontramos el producto, mostramos un error
            res.status(404).send("Producto no encontrado");
        }
    });
};

