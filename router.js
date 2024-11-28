const express = require("express");
const connection = require("./database/db");
const crud = require("./controller/crud");
const carrito = require("./controller/carrito");
const router = express.Router();

router.get("/login", (req, res)=>{
    res.render("login");
    //res.render("login");
})
router.get("/registro", (req, res)=>{
    res.render("register");
})
/* router.get("/admin", (req, res)=>{
    res.render("admin");
}) */
router.get("/eliminarProducto", (req, res) => {
    res.render("eliminarProducto");  
});
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

router.get('/edit/:idProductos', (req,res)=>{    
    const idProducto = req.params.idProductos;
    connection.query('SELECT * FROM productos WHERE idProducto=?',[idProducto] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('edit.ejs', {productos:results[0]});            
        }        
    });
});

//-eliminar productos
router.get('/delete/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;
    connection.query('DELETE FROM productos WHERE idProducto = ?',[idProducto], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('/admin');         
        }
    })
});




module.exports = router;