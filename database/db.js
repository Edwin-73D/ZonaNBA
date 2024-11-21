const mysql = require("mysql2");

// Crea una conexión a tu base de datos MySQL
const connection = mysql.createConnection({
  host: "localhost",        // Dirección del servidor MySQL (generalmente "localhost" o "127.0.0.1")
  user: "root",             // Usuario MySQL (si estás usando "root", es el administrador)
  password: "iron", // Contraseña para el usuario MySQL
  database: "camisetas_nba" // Nombre de la base de datos a la que quieres acceder
});

// Establece la conexión
connection.connect((err) => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
  } else {
    console.log("Conexión exitosa a MySQL!");
  }
});

module.exports = connection;