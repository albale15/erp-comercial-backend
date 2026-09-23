// 1. Simulamos una conexión a la base de datos que tarda 2 segundos.
// Devuelve una "Promesa" (Promise).
function consultarBaseDeDatos() {
    return new Promise((resolver) => {
        setTimeout(() => {
            resolver([
                { id: 1, producto: 'Harina 50kg', stock: 10 },
                { id: 2, producto: 'Chocolate amargo', stock: 5 }
            ]);
        }, 2000); // 2000 milisegundos = 2 segundos
    });
}

// 2. Creamos una función ASÍNCRONA (async) para manejar la espera sin bloquear el servidor.
async function obtenerInventario() {
    console.log("Iniciando consulta al sistema...");
    
    // El 'await' pausa la ejecución de ESTA línea hasta que la base de datos responda.
    // Mientras tanto, Node.js podría estar atendiendo a otros usuarios.
    const datos = await consultarBaseDeDatos(); 
    
    console.log("Datos recibidos de la base de datos:");
    console.log(datos);
}

// 3. Ejecutamos la función
obtenerInventario();
console.log("Esta línea está al final del archivo, pero mira cuándo se imprime.");