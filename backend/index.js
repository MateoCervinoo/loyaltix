const express = require("express");
const sequelize = require("./database/database");

// Crear servidor
const app = express();
app.use(express.json());

// Controlar la ruta
app.get("/", (req, res) => {
    res.send("Backend de LoyalTix");
});

// Configuración general
const port = 3000;
app.locals.fechaInicio = new Date();

// Iniciar servidor solo si conecta a la base
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión exitosa a PostgreSQL");

        app.listen(port, () => {
            console.log(`Sitio escuchando en el puerto ${port}`);
        });
    } catch (error) {
        console.error("Error de conexión:", error);
    }
};

startServer();