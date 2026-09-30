// // Importamos el módulo nativo 'http' de Node.js (no requiere instalación extra)
// const http = require('http');

// // Los datos simulados de nuestro ERP
// const inventario = [
//     { id: 1, producto: 'Harina 50kg', stock: 10 },
//     { id: 2, producto: 'Chocolate amargo', stock: 5 }
// ];

// // Creamos el servidor. 'req' = Petición (Request), 'res' = Respuesta (Response)
// const server = http.createServer((req, res) => {
    
//     console.log(`Detectamos una petición HTTP a la ruta: ${req.url}`);

//     // ROUTING BÁSICO: Si piden /inventario con el método GET
//     if (req.url === '/inventario' && req.method === 'GET') {
        
//         // 1. Cabecera (Header) y Código de Estado (200 OK)
//         res.writeHead(200, { 'Content-Type': 'application/json' });
        
//         // 2. Convertimos los datos de Node a formato JSON universal y los enviamos
//         res.end(JSON.stringify(inventario));

//     } // RUTA 2: POST /inventario (Crear)
//     else if (req.url === '/inventario' && req.method === 'POST') {
//         let body = ''; // Aquí guardaremos los paquetes de datos que lleguen

//         // Evento 'data': Se dispara cada vez que llega un paquete (chunk) por la red
//         req.on('data', (chunk) => {
//             body += chunk.toString(); 
//         });

//         // Evento 'end': Se dispara cuando el cliente terminó de enviar todos los paquetes
//         req.on('end', () => {
//             // Traducimos el texto JSON (el "inglés") a un objeto nativo de JavaScript
//             const nuevoProducto = JSON.parse(body);
            
//             // Le asignamos un ID dinámico y lo guardamos en nuestra base de datos simulada (memoria)
//             nuevoProducto.id = inventario.length + 1;
//             inventario.push(nuevoProducto);

//             // Respondemos con código 201 (Created)
//             res.writeHead(201, { 'Content-Type': 'application/json' });
//             res.end(JSON.stringify({ mensaje: 'Producto creado con éxito', producto: nuevoProducto }));
//         });
//     } else {
//         // Cualquier otra ruta que no exista
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end("Error 404: Ruta no encontrada en el ERP Comercial.");
//     }
// });

// // Encendemos el servidor en el puerto 3000
// const PUERTO = 3000;
// server.listen(PUERTO, () => {
//     console.log(`Servidor backend escuchando en http://localhost:${PUERTO}`);
// });

//version sql
const http = require('http');
// Importamos la clase Pool del driver 'pg'. Un "Pool" administra múltiples conexiones 
// simultáneas para no saturar la base de datos si entran muchos usuarios.
const { Pool } = require('pg');

// Configuramos la conexión a nuestro motor local
const pool = new Pool({
    user: 'postgres',           // El superusuario por defecto
    host: 'localhost',          // Tu propia PC
    database: 'erp_comercial',  // La base de datos que creaste en pgAdmin
    password: 'VAlTsm1523', // ¡CÁMBIALO por la contraseña que pusiste al instalar!
    port: 5432,                 // El puerto por defecto del motor PostgreSQL
});

const server = http.createServer(async (req, res) => {
    
    // RUTA: GET /inventario -> Ahora leerá desde PostgreSQL, no de la memoria RAM
    if (req.url === '/inventario' && req.method === 'GET') {
        try {
            // Mandamos el comando SQL real a través del "cable"
            // await: Pausamos Node.js hasta que PostgreSQL responda
            const resultado = await pool.query('SELECT * FROM productos');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // resultado.rows contiene los datos que devolvió la base de datos
            res.end(JSON.stringify(resultado.rows));
            
        } catch (error) {
            console.error("Error al consultar la base de datos:", error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Falla interna del servidor" }));
        }
    } 
    
    // RUTA: POST /inventario -> Guardará permanentemente en el disco duro
    else if (req.url === '/inventario' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        
        req.on('end', async () => {
            try {
                const nuevoProducto = JSON.parse(body);
                
                // Enviamos el comando SQL (INSERT) para guardar los datos
                // $1 y $2 son parámetros de seguridad para evitar hackeos (SQL Injection)
                const querySQL = 'INSERT INTO productos (nombre, stock) VALUES ($1, $2) RETURNING *';
                const valores = [nuevoProducto.nombre, nuevoProducto.stock];
                
                const resultado = await pool.query(querySQL, valores);
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ mensaje: 'Guardado en PostgreSQL', producto: resultado.rows[0] }));
                
            } catch (error) {
                console.error("Error al guardar:", error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Error de validación de base de datos" }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Ruta no encontrada.");
    }
});

const PUERTO = 3000;
server.listen(PUERTO, () => {
    console.log(`Servidor conectado a DB escuchando en http://localhost:${PUERTO}`);
});