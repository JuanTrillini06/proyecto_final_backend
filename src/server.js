import MongoSingleton from "./config/mongodb-singleton.js";
import config from "./config/config.js";
import app from "./app.js";

// Configuracion del puerto
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`El servidor corre en el puerto: ${PORT}`);
});

// Conexion a mongo
const mongoInstance = async () => {
    try {
        await MongoSingleton.getInstance();
    } catch (error) {
        console.error(error);
        process.exit();
    }
};
mongoInstance();