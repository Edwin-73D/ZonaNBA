const express = require("express");
const connection = require("./database/db");
const crud = require("./controller/crud");
const auth = require("./controller/auth"); 
const carrito = require("./controller/carrito");
const router = express.Router();



// Página principal (Home)
router.get("/", auth.renderHomePage);

// Rutas de autenticación (login y registro)
router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/registro", (req, res) => {
    res.render("register");
});
router.post("/login", auth.login); // Ruta POST para login
router.post("/register", auth.register); // Ruta POST para registro

// Cerrar sesión
router.get("/logout", auth.logout);

// Verificar autenticación (middleware)
router.use(auth.verificarAutenticacion); // Protege las rutas que requieran autenticación

// Aquí puedes agregar otras rutas protegidas que necesiten autenticación


router.get("/create", (req, res)=>{
    res.render("create");
})

router.get("/admin", (req, res)=>{

    connection.query("SELECT * FROM productos", (error, results)=>{
        if(error){
            throw error;
        }else{
            res.render("admin", {results:results}); 
        }
    }) 
})

router.get('/product/:idProducto', crud.getProductDetails);




router.post("/save", crud.save);
router.post("/update", crud.update);

router.get('/edit/:idProducto', crud.editProduct);

// Ruta para eliminar producto
router.get('/delete/:idProducto', crud.deleteProduct);


// Ruta para mostrar el carrito
router.get("/carrito", auth.verificarAutenticacion, carrito.mostrarCarrito);

// Ruta para agregar un producto al carrito
router.post("/carrito/agregar", auth.verificarAutenticacion, carrito.agregarAlCarrito);

// Ruta para eliminar un producto del carrito
router.post("/carrito/eliminar/:producto_id", auth.verificarAutenticacion, carrito.eliminarDelCarrito);




module.exports = router;