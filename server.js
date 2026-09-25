// Importamos el módulo nativo 'http' de Node.js (no requiere instalación extra)
const http = require('http');

// Los datos simulados de nuestro ERP
const inventario = [
    { id: 1, producto: 'Harina 50kg', stock: 10 },
    { id: 2, producto: 'Chocolate amargo', stock: 5 }
];

// Creamos el servidor. 'req' = Petición (Request), 'res' = Respuesta (Response)
const server = http.createServer((req, res) => {
    
    console.log(`Detectamos una petición HTTP a la ruta: ${req.url}`);

    // ROUTING BÁSICO: Si piden /inventario con el método GET
    if (req.url === '/inventario' && req.method === 'GET') {
        
        // 1. Cabecera (Header) y Código de Estado (200 OK)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        // 2. Convertimos los datos de Node a formato JSON universal y los enviamos
        res.end(JSON.stringify(inventario));

    } else {
        // Cualquier otra ruta que no exista
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Error 404: Ruta no encontrada en el ERP Comercial.");
    }
});

// Encendemos el servidor en el puerto 3000
const PUERTO = 3000;
server.listen(PUERTO, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PUERTO}`);
});