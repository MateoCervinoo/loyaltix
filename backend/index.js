const express = require("express");

//Crear servidor
const app = express();

//Controlar la ruta
app.get("/", (req, res) => {
    res.send("Backend de LoyalTix");
});

//Levantar servidor
const port = 3000;
app.locals.fechaInicio = new Date();
app.listen(port, () => {
    console.log(`Sitio escuchando en el puerto ${port}`);
});