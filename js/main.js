let lista = []; // Productos
let aportes = []; // Aportes
let historial = []; // Historial de Operaciones

// Constantes de Web Storage
const KEY_HISTORIAL = "historial";

// Mensajes UX (SweetAlert2) 
function mostrarMensajeUX(tipo, titulo, texto, timer = 2000) {
    if (tipo === "confirm") {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });
    } else {
        Swal.fire({
            icon: tipo, // 'success', 'error', 'info'
            title: titulo,
            text: texto,
            timer: timer,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}

// Cargar arrays desde localStorage o usar Fetch/JSON

async function cargarProductos() {
    let productos = [];
    try {
        const dataLocal = JSON.parse(localStorage.getItem("productos"));
        if (dataLocal && dataLocal.length > 0) {
            dataLocal.forEach(p => {
                productos.push(new Producto(p.id, p.nombre, p.precio, p.cantidad))
            });
            mostrarMensajeUX('info', 'Datos recuperados', 'Se recuperó la lista de productos guardada.', 1500);
        } else {
            const response = await fetch('./assets/datos.json');
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            const data = await response.json();
            data.productos.forEach(p => {
                productos.push(new Producto(p.id, p.nombre, p.precio, p.cantidad))
            });
            mostrarMensajeUX('info', 'Datos cargados', 'Lista de productos inicial cargada desde JSON.', 1500);
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
        Swal.fire({ icon: 'error', title: 'Error de Carga', text: 'No se pudo cargar la lista de productos iniciales. Intente recargar la página.', footer: 'Mensaje no técnico para el usuario' });
    }
    return productos;
}

async function cargarAportes() {
    let aportesList = [];
    try {
        const dataLocal = JSON.parse(localStorage.getItem("aportes"));
        if (dataLocal && dataLocal.length > 0) {
            dataLocal.forEach(a => {
                aportesList.push(new Aporte(a.id, a.nombre, a.monto))
            });
        } else {
            const response = await fetch('./assets/datos.json');
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            const data = await response.json();
            data.aportes.forEach(a => {
                aportesList.push(new Aporte(a.id, a.nombre, a.monto))
            });
        }
    } catch (error) {
        console.error("Error al cargar aportes:", error);
    }
    return aportesList;
}

function cargarHistorial() {
    try {
        const dataLocal = JSON.parse(localStorage.getItem(KEY_HISTORIAL));
        if (dataLocal && dataLocal.length > 0) {
            historial = dataLocal.map(item => {
                return new Historial(item.id, item.accion, item.detalles);
            });
        } else {
            historial = [];
        }
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

function logAccion(accion, detalles = '') {   
    let id;
    if(historial.length > 0){
        id = historial[0].getId() + 1;    
    }
    else{
        id = 1;
    }
    const nuevoRegistro = new Historial(id, accion, detalles);

    historial.unshift(nuevoRegistro);
    
    guardarStorage(); 
    imprimirHistorial(); 
}

// DOM
const secciones = document.querySelectorAll(".seccion");
const menuBtns = document.querySelectorAll("#menu button");
const productosCtn = document.getElementById("productosCtn");
const aportesCtn = document.getElementById("aportesCtn");
const resumenCtn = document.getElementById("resumenCtn");
const historialCtn = document.getElementById("historialCtn");
const limpiarStorageBtn = document.getElementById("limpiarStorage");
const mensajeErrorDiv = document.getElementById("mensajeError");
const btnPagarResumen = document.getElementById("btnPagarResumen");

// Formularios y botones limpiar
const formProducto = document.getElementById("formProducto");
const formAporte = document.getElementById("formAporte");
const limpiarProducto = document.getElementById("limpiarProducto");
const limpiarAporte = document.getElementById("limpiarAporte");

// Funciones
function mostrarSeccion(id) {
    secciones.forEach(seccion => {
        if (seccion.id === id) {
            seccion.style.display = "block";
        } else {
            seccion.style.display = "none";
        }
    });
}

function guardarStorage() {
    localStorage.setItem("productos", JSON.stringify(lista));
    localStorage.setItem("aportes", JSON.stringify(aportes));
    localStorage.setItem(KEY_HISTORIAL, JSON.stringify(historial));
}

function totalProductos() {
    let total = 0;
    for (const producto of lista) {
        total += producto.subtotal();
    }
    return total;
}

function totalAportes() {
    let total = 0;
    for (const aporte of aportes) {
        total += aporte.getMonto();
    }
    return total;
}

function imprimirResumen() {
    resumenCtn.innerHTML = "";
    mensajeErrorDiv.innerHTML = "";

    const totalCosto = totalProductos(); // Total a pagar
    const totalAportado = totalAportes(); // Total alcanzado
    const personas = aportes.length;
    let cuota = 0;

    if (totalCosto === 0) {
        mensajeErrorDiv.innerHTML = 'Agrega productos para calcular el total.';
        return;
    }

    if (personas > 0) {
        cuota = totalCosto / personas;
    } else {
        mensajeErrorDiv.innerHTML = 'Agrega participantes en la sección Aportes para calcular la cuota.';
        return;
    }

    const infoCosto = document.createElement("h2");
    infoCosto.textContent = `Total a cubrir: $${totalCosto.toFixed(2)} - Cuota por persona: $${cuota.toFixed(2)}`;
    resumenCtn.appendChild(infoCosto);

    const infoAportado = document.createElement("p");
    infoAportado.style.fontWeight = 'bold';
    infoAportado.style.fontSize = '1.1em';

    infoAportado.textContent = `Total Alcanzado (Aportes): $${totalAportado.toFixed(2)}`;

    // Aplicar color: verde si cubre el costo, rojo si no
    if (totalAportado >= totalCosto) {
        infoAportado.style.color = '#27ae60'; // Verde
    } else {
        infoAportado.style.color = '#e74c3c'; // Rojo
    }
    resumenCtn.appendChild(infoAportado);


    for (const a of aportes) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h4>${a.getNombre()} (ID: ${a.getId()})</h4><p>${a.estado(cuota)}</p>`;
        resumenCtn.appendChild(card);
    }
}

function imprimirAportes() {
    aportesCtn.innerHTML = "";
    for (const a of aportes) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h4>${a.getNombre()}</h4><p>ID: ${a.getId()}</p><p>Aporte: $${a.getMonto().toFixed(2)}</p><div class="card-buttons">
            <button class="editar" data-id="${a.getId()}" data-tipo="aporte">Editar</button>
            <button class="eliminar" data-id="${a.getId()}" data-tipo="aporte">Eliminar</button>
        </div>`;
        aportesCtn.appendChild(card);

        card.querySelector(".editar").addEventListener("click", (e) => {
            const idEditar = parseInt(e.target.dataset.id);
            editarItem(idEditar, 'aporte');
        });

        card.querySelector(".eliminar").addEventListener("click", (e) => {
            const idEliminar = parseInt(e.target.dataset.id);
            eliminarItem(idEliminar, 'aporte');
        });
    }
}

function imprimirProductos() {
    productosCtn.innerHTML = "";

    for (const p of lista) {
        const card = document.createElement("div");
        card.className = "card";
        // AGREGADO: Botones Editar y Eliminar
        card.innerHTML = `<h4>${p.getNombre()}</h4><p>ID: ${p.getId()}</p><p>Cantidad: ${p.getCantidad()}</p><p>Precio: $${p.getPrecio().toFixed(2)}</p><p>Subtotal: $${p.subtotal().toFixed(2)}</p><div class="card-buttons">
            <button class="editar" data-id="${p.getId()}" data-tipo="producto">Editar</button>
            <button class="eliminar" data-id="${p.getId()}" data-tipo="producto">Eliminar</button>
        </div>`;
        productosCtn.appendChild(card);

        card.querySelector(".editar").addEventListener("click", (e) => {
            const idEditar = parseInt(e.target.dataset.id);
            editarItem(idEditar, 'producto');
        });

        card.querySelector(".eliminar").addEventListener("click", (e) => {
            const idEliminar = parseInt(e.target.dataset.id);
            eliminarItem(idEliminar, 'producto');
        });
    }
}

function imprimirHistorial() {
    historialCtn.innerHTML = "";
    if (historial.length === 0) {
        historialCtn.innerHTML = '<p>Aún no hay operaciones registradas en el historial.</p>';
        return;
    }

    historial.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<p class="fecha-accion"><span class="fecha">${item.fecha}</span> - <strong>${item.accion}</strong></p><p class="detalles">${item.detalles}</p>`;
        historialCtn.appendChild(div);
    });
}


function eliminarItem(id, tipo) {
    const titulo = `Eliminar ${tipo}`;
    const texto = `¿Estás seguro de eliminar este ${tipo}?`;

    mostrarMensajeUX("confirm", titulo, texto).then((result) => {
        if (result.isConfirmed) {
            if (tipo === 'producto') {
                const productoEliminado = lista.find(p => p.getId() === id);
                lista = lista.filter(producto => producto.getId() !== id);
                imprimirProductos();
                logAccion('Producto Eliminado', `ID: ${id}. Producto: ${productoEliminado ? productoEliminado.getNombre() : 'Desconocido'}.`);
            } else if (tipo === 'aporte') {
                const aporteEliminado = aportes.find(a => a.getId() === id);
                aportes = aportes.filter(aporte => aporte.getId() !== id);
                imprimirAportes();
                // Log de Aporte Eliminado
                logAccion('Aporte Eliminado', `ID: ${id}. Persona: ${aporteEliminado ? aporteEliminado.getNombre() : 'Desconocida'} eliminada.`);
            }
            guardarStorage();
            imprimirResumen();
            mostrarMensajeUX('success', 'Eliminado', 'El item fue eliminado correctamente.', 1500);
        }
    });
}

function editarItem(id, tipo) {
    let item;
    let titulo;
    let htmlContent;

    if (tipo === 'producto') {
        item = lista.find(p => p.getId() === id);
        if (!item) return;

        titulo = `Editar Producto: ${item.getNombre()}`;
        htmlContent = `<label for="swal-input1" class="swal-label-edit">Nombre:</label><input id="swal-input1" class="swal2-input" value="${item.getNombre()}" placeholder="Nombre"><label for="swal-input2" class="swal-label-edit">Cantidad:</label><input id="swal-input2" class="swal2-input" type="number" value="${item.getCantidad()}" min="1" step="1"><label for="swal-input3" class="swal-label-edit">Precio:</label><input id="swal-input3" class="swal2-input" type="number" value="${item.getPrecio()}" min="1" step="0.01">`;
    } else if (tipo === 'aporte') {
        item = aportes.find(a => a.getId() === id);
        if (!item) return;

        titulo = `Editar Aporte de: ${item.getNombre()}`;
        htmlContent = `<label for="swal-input1" class="swal-label-edit">Nombre:</label><input id="swal-input1" class="swal2-input" value="${item.getNombre()}" placeholder="Nombre"><label for="swal-input2" class="swal-label-edit">Monto Aportado:</label><input id="swal-input2" class="swal2-input" type="number" value="${item.getMonto()}" min="1" step="0.01">`;
    } else {
        return;
    }

    Swal.fire({
        title: titulo,
        html: htmlContent,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = Swal.getPopup().querySelector('#swal-input1').value.trim();
            const valor1 = parseFloat(Swal.getPopup().querySelector('#swal-input2').value);
            let valor2 = null;
            if (tipo === 'producto') {
                const inputPrecio = Swal.getPopup().querySelector('#swal-input3');
                if (inputPrecio) {
                    valor2 = parseFloat(inputPrecio.value);
                }
            }

            if (nombre === '' || isNaN(valor1) || valor1 <= 0 || (tipo === 'producto' && (isNaN(valor2) || valor2 <= 0))) {
                Swal.showValidationMessage(`Por favor, revisa todos los campos. Asegúrate de que los valores sean números positivos.`);
                return false;
            }

            return { nombre, valor1, valor2 };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { nombre, valor1, valor2 } = result.value;
            const nombreAnterior = item.getNombre();
            
            if (tipo === 'producto') {
                item.nombre = nombre;
                item.cantidad = valor1;
                item.precio = valor2;

                logAccion('Producto Editado', `ID ${id}: '${nombreAnterior}' a '${nombre}'. Cant: ${valor1}, Precio: $${valor2.toFixed(2)}.`);
                imprimirProductos();
            } else if (tipo === 'aporte') {
                item.nombre = nombre;
                item.monto = valor1;

                logAccion('Aporte Editado', `ID ${id}: '${nombreAnterior}' a '${nombre}'. Monto: $${valor1.toFixed(2)}.`);
                imprimirAportes();
            }

            guardarStorage();
            imprimirResumen();
            mostrarMensajeUX('success', 'Guardado', 'Los datos se actualizaron correctamente.', 1500);
        }
    });
}

// Eventos
for (const btn of menuBtns) {
    btn.addEventListener("click", () => {
        mostrarSeccion(btn.dataset.seccion);
        imprimirProductos();
        imprimirAportes();
        imprimirResumen();
        imprimirHistorial();
    });
}

formProducto.addEventListener("submit", e => {
    e.preventDefault();
    try {
        const nombre = formProducto.prodNombre.value.trim();
        const cantidad = parseFloat(formProducto.prodCantidad.value);
        const precio = parseFloat(formProducto.prodPrecio.value);

        if (nombre === "" || isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
            throw new Error("Datos de producto inválidos.");
        }

        let id;
        if (lista.length > 0) {
            id = lista[lista.length - 1].getId() + 1;
        } else {
            id = 1;
        }
        lista.push(new Producto(id, nombre, precio, cantidad));

        guardarStorage();
        imprimirProductos();
        imprimirResumen();
        formProducto.reset();
        mostrarMensajeUX('success', 'Agregado', `${nombre} agregado a la lista.`, 1500);
        logAccion('Producto Agregado', `${nombre} x ${cantidad} a $${precio.toFixed(2)}`);

    } catch (error) {
        console.error("Error en formulario Producto:", error.message);
        mostrarMensajeUX('error', 'Error al agregar producto', 'Asegúrate de que el nombre no esté vacío y los valores de cantidad y precio sean números positivos.', 3000);
    }
});

formAporte.addEventListener("submit", e => {
    e.preventDefault();
    try {
        const nombre = formAporte.aporteNombre.value.trim();
        const monto = parseFloat(formAporte.aporteMonto.value);

        if (nombre === "" || isNaN(monto) || monto <= 0) {
            throw new Error("Datos de aporte inválidos.");
        }

        let id;
        if (aportes.length > 0) {
            id = aportes[aportes.length - 1].getId() + 1;
        } else {
            id = 1;
        }
        aportes.push(new Aporte(id, nombre, monto));

        guardarStorage();
        imprimirAportes();
        imprimirResumen();
        formAporte.reset();
        mostrarMensajeUX('success', 'Aporte agregado', `${nombre} aportó $${monto.toFixed(2)}`, 1500);

        logAccion('Aporte Agregado', `${nombre} aportó $${monto.toFixed(2)}.`);

    } catch (error) {
        console.error("Error en formulario Aporte:", error.message);
        mostrarMensajeUX('error', 'Error al agregar aporte', 'Asegúrate de que el nombre no esté vacío y el monto sea un número positivo.', 3000);
    }
});

// Botón Pagar
btnPagarResumen.addEventListener("click", () => {
    const totalCosto = totalProductos();
    const totalAportado = totalAportes();
    const personas = aportes.length;
    let cuota = 0;

    if (totalCosto <= 0) {
        mostrarMensajeUX('error', 'Cálculo pendiente', 'No hay productos que pagar.');
        return;
    }
    if (personas === 0) {
        mostrarMensajeUX('error', 'Cálculo pendiente', 'Asegúrate de tener al menos un participante.');
        return;
    }

    if (totalAportado < totalCosto) {
        const faltante = (totalCosto - totalAportado).toFixed(2);
        mostrarMensajeUX('error', 'Fondos Insuficientes', `❌ El total aportado ($${totalAportado.toFixed(2)}) NO cubre el costo total ($${totalCosto.toFixed(2)}). Faltan $${faltante}.`);
        return;
    }

    // Si llegamos aquí, hay fondos suficientes se procede el pago. Cálculo del balance individual.
    cuota = totalCosto / personas;
    const personasADeben = aportes.filter(a => a.getMonto() < cuota);

    let mensajeBalance;
    if (personasADeben.length > 0) {
        const montoADeber = personasADeben.reduce((acc, a) => acc + (cuota - a.getMonto()), 0);
        mensajeBalance = `El pago fue confirmado. ¡Se llegó al total! Pero ${personasADeben.length} personas aún deben un total de $${montoADeber.toFixed(2)} a sus compañeros.`;
    } else {
        mensajeBalance = `El pago fue confirmado. Todas las personas cubrieron su cuota individual ($${cuota.toFixed(2)}) y hubo un excedente de $${(totalAportado - totalCosto).toFixed(2)}.`;
    }

    const logDetalles = `Total Producto Pagado: $${totalCosto.toFixed(2)}. ${mensajeBalance}`;
    logAccion('Pago Confirmado', logDetalles);

    //Eliminar todos los productos y aportes
    lista = [];
    aportes = [];

    //Actualizar
    guardarStorage();
    imprimirProductos();
    imprimirAportes();
    imprimirResumen();

    mostrarMensajeUX('success', '¡Pagado!', 'El balance ha sido liquidado y registrado en el historial. Productos y Aportes eliminados.', 2500);
});

// Botones limpiar
limpiarProducto.addEventListener("click", () => formProducto.reset());
limpiarAporte.addEventListener("click", () => formAporte.reset());

limpiarStorageBtn.addEventListener("click", () => {
    mostrarMensajeUX("confirm", 'Limpiar todos los datos', "Se eliminarán todos los productos y aportes guardados en tu navegador.").then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            lista = [];
            aportes = [];
            historial = [];
            imprimirProductos();
            imprimirAportes();
            imprimirResumen();
            imprimirHistorial();
            mostrarMensajeUX('success', 'Limpieza completa', "Todos los datos han sido eliminados.", 1500);
        }
    });
});

// Inicializar Asíncronamente 
async function inicializar() {
    lista = await cargarProductos();
    aportes = await cargarAportes();
    cargarHistorial();

    mostrarSeccion("productos");
    imprimirProductos();
    imprimirAportes();
    imprimirResumen();
    imprimirHistorial();
}

// Inicia la aplicación cargando los datos
inicializar();