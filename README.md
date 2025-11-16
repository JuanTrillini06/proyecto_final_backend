Procedimiento para correr el proyecto

- Clonar el repositorio
- Ejecutar "npm i" en la linea de comandos
- Descomprimir la carpeta .env.zip adjunta
- Pegar los archivos .env en la ruta src/config

Ejecuciones de entornos:
En la linea de comandos se pueden ejecutar dos entornos, "dev" y "test".

Para ejecutar dev:
En linea de comandos ejecutar "npm run dev". Da de alta el servidor en localhost:9090

Para ejecutar test:
En linea de comandos ejecutar "npm test". Ejecuta los diferentes test creados dando respuestas en la teminal, los test son los siguientes:
- Faileture test: Corrobora login de usuarios inexistentes y compras de productos sin stock.
- Mock test: Genera una x cantidad de usuarios y productos y ejecuta metodos get en apis de ambos para obtenerlos.
- Purchase test: Registra usuarios, añade productos en sus carritos y ejecuta la logica de compra.
- Register test: Registra multiples usuarios de uno en uno y verifica persistencia en base de datos.
- ZZZ Teardown test: Limpia todas las colecciones y cierra la conexion a la base de datos luego de ejecutar todos los test.

Aclaracion:
Las bases de datos de entorno "dev" y "test" son diferentes, por lo que la ejecucion de los test no afecta a los datos cargados y renderizados en el entorno dev.

DOCUMENTACION DE ENDPOINTS
La documentacion está creada con Swagger, para acceder a ella hay que ingresar al siguiente endpoint desde el navegador:

http://localhost:9090/apidocs
