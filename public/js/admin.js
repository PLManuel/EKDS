// Función para obtener el carrito de la sesión activa
async function permitirAcceso() {
    try {
        // Verificar si el usuario está logueado
        const perfilResponse = await fetch('/perfil');
        if (!perfilResponse.ok) {
            accesoDenegado();
            return;
        }

        const perfil = await perfilResponse.json();

        if(perfil.tipo_usuario !== 'admin') {
            accesoDenegado();
            return;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error');
    }
}

document.addEventListener('DOMContentLoaded', permitirAcceso);

const crudForm = document.getElementById("crud");
const stockForm = document.getElementById("reabastecer")
const empleadoForm = document.getElementById("empleado");
const inventarioContainer = document.getElementById('inventarioContainer');
const btninventario = document.getElementById('btninventario');
const btnCrud = document.getElementById("btncrud");
const btnStock = document.getElementById("btnstock");
const btnEmpleado = document.getElementById("btnempleado");
const btnKardex = document.getElementById("btnkardex");
const kardexTabla = document.getElementById("kardex");
const tabla = document.querySelector("#kardexTabla tbody");


// mostrar el kardex
function showKardex() {
    crudForm.style.display = "none";
    inventarioContainer.style.display = "none";
    empleadoForm.style.display = "none";
    stockForm.style.display = "none";
    kardexTabla.style.display = "block";
}

// mostrar el formulario CRUD
function showCrud() {
    crudForm.style.display = "block";
    inventarioContainer.style.display = "none";
    empleadoForm.style.display = "none";
    stockForm.style.display = "none";
    kardexTabla.style.display = "none";

}

// mostrar formulario para reabastecer stock
function showRStock() {
    stockForm.style.display = "block";
    inventarioContainer.style.display = "none";
    empleadoForm.style.display = "none";
    crudForm.style.display = "none";
    kardexTabla.style.display = "none";

}

// mostrar el formulario de empleado
function showEmpleado() {
    empleadoForm.style.display = "block";
    inventarioContainer.style.display = "none";
    crudForm.style.display = "none";
    stockForm.style.display = "none";
    kardexTabla.style.display = "none";

}

function showInventario() {
    obtenerProductos();
    inventarioContainer.style.display = "block";
    crudForm.style.display = "none"
    empleadoForm.style.display = "none";
    stockForm.style.display = "none";
    kardexTabla.style.display = "none";

}

// Evento para mostrar el inventario
btninventario.addEventListener('click', showInventario);

// al darle click se aplican las funciones
btnCrud.addEventListener("click", showCrud);
btnStock.addEventListener("click", showRStock);
btnEmpleado.addEventListener("click", showEmpleado);
//Mostrar kardex
btnKardex.addEventListener("click", showKardex);

// mostrar solo el formulario CRUD por defecto
showCrud();

const crud = document.getElementById('crudForm');

crud.addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/crud', {
        method: 'POST',
        body: new URLSearchParams(new FormData(e.target)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });;

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        crud.reset();
    } else {
        alert(result.message);
    }
});

const empleado = document.getElementById('empleadoForm');

empleado.addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/registerE', {
        method: 'POST',
        body: new URLSearchParams(new FormData(e.target)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });;

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        empleado.reset();
    } else {
        alert(result.message);
    }
});

const agregarProductoBtnR = document.getElementById('btn-addReabastecer');
const formularioR = document.getElementById('formularioR');
const reabastecerForm = document.getElementById('reabastecerForm');
const cancelarBtnR = document.getElementById('btn-cancelReabastecer');

// para mostrar el div del formulario al hacer clic en el botón
agregarProductoBtnR.addEventListener('click', () => {
    formularioR.style.display = 'block';
});

// para ocultar el formulario y vaciar los campos al hacer clic en "Cancelar"
cancelarBtnR.addEventListener('click', (event) => {
    event.preventDefault(); // evita que recargue la página si el botón está dentro de un formulario
    formularioR.style.display = 'none'; // oculta el formulario

    // vaciar los campos del formulario
    reabastecerForm.reset();
});

let compras = []; // arreglo para almacenar los productos

const listaReabastecer = document.getElementById('listaReabastecer');
const addReabastecer = document.getElementById('addR');
const proveedorInputR = document.getElementById('proveedorR');

// evento del botón añadir producto
reabastecerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/verificarR', {
        method: 'POST',
        body: new URLSearchParams(new FormData(e.target)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });;

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
    } else {
        alert(result.message);
        return;
    }

    const formData = new FormData(reabastecerForm);

    // capturar datos del formulario
    const producto = {
        nombre: formData.get('nombre'),
        cantidad: parseInt(formData.get('cantidad')),
    };

    // añadir el producto a lista
    compras.push(producto);

    const li = document.createElement('li');
    li.textContent = `${producto.nombre} - Cantidad: ${producto.cantidad}`;

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.style.marginLeft = '10px';

    btnEliminar.addEventListener('click', () => {
        const index = compras.indexOf(producto);
        if (index > -1) {
            compras.splice(index, 1);
            li.remove();
        }
    });

    li.appendChild(btnEliminar);

    listaReabastecer.appendChild(li);

    reabastecerForm.reset();
});

document.getElementById('listaReabastecerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const proveedor = proveedorInputR.value;
    if (compras.length === 0) {
        alert('Añada al menos un producto.');
        return;
    }

    const response = await fetch('/reabastecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proveedor, productos: compras })
    });

    if (response.ok) {
        alert('Stock actualizado y compra registrada exitosamente');

        compras.length = 0;
        listaReabastecer.innerHTML = '';
        proveedorInputR.value = '';

    } else {
        alert('Hubo un error al registrar la compra.');
    }
});

// Obtener referencias a los elementos del DOM
const tablaInventario = document.getElementById('tablaInventario').querySelector('tbody');

async function obtenerProductos() {
    const tablaBody = document.querySelector("#tablaInventario tbody");

    try {
        // Solicitar productos al servidor
        const response = await fetch("/api/productos");
        const productos = await response.json();

        // Limpiar tabla antes de agregar contenido
        tablaBody.innerHTML = "";

        // Renderizar productos en la tabla
        productos.forEach((producto) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.Nombre}</td>
                <td>${producto.Marca}</td>
                <td>${producto.Precio}</td>
                <td>${producto.Categoria}</td>
                <td>${producto.Stock}</td>
                <td>${producto.Estado}</td>
                <td>
                    <button class="editar-btn" data-id="${producto.ID}">Editar</button>
                    <button class="eliminar-btn" data-id="${producto.ID}">Eliminar</button>
                    <button class="estado-btn" data-id="${producto.ID}" data-estado="${producto.Estado}">
                        ${producto.Estado === "habilitado" ? "Deshabilitar" : "Habilitar"}
                    </button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

        // asignar eventos a los botones de estado
        document.querySelectorAll(".estado-btn").forEach((btn) =>
            btn.addEventListener("click", cambiarEstadoProducto)
        );

        // asignar eventos a los botones de eliminar
        document.querySelectorAll(".eliminar-btn").forEach((btn) =>
            btn.addEventListener("click", eliminarProducto)
        );

        // asignar eventos a los botones de editar
        document.querySelectorAll(".editar-btn").forEach((btn) =>
            btn.addEventListener("click", editarProducto)
        );
    } catch (error) {
        console.error("Error al cargar el inventario:", error);
    }
};

async function cambiarEstadoProducto(event) {
    const productoId = event.target.getAttribute("data-id");
    const estadoActual = event.target.getAttribute("data-estado");
    const nuevoEstado = estadoActual === "habilitado" ? "deshabilitado" : "habilitado";

    try {
        const response = await fetch(`/api/productos/${productoId}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (response.ok) {
            // actualizar el estado y el botón 
            event.target.setAttribute("data-estado", nuevoEstado);
            event.target.textContent = nuevoEstado === "habilitado" ? "Deshabilitar" : "Habilitar";
            event.target.closest("tr").querySelector("td:nth-child(6)").textContent = nuevoEstado;
            alert(`El producto ha sido ${nuevoEstado}.`);
        } else {
            alert("No se pudo actualizar el estado del producto.");
        }
    } catch (error) {
        console.error("Error al cambiar el estado del producto:", error);
    }
}

async function eliminarProducto(event) {
    const productoId = event.target.getAttribute("data-id");

    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        try {
            const response = await fetch(`/api/productos/${productoId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Eliminar la fila de la tabla
                event.target.closest("tr").remove();
                alert("Producto eliminado correctamente.");
            } else {
                alert("No se pudo eliminar el producto.");
            }
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    }
}

// Función de edición (no me acuerdo si funcionaba)
function editarProducto(event) {
    const productoId = event.target.getAttribute("data-id");
    // redirigir al formulario pasando el ID del producto en la URL
    window.location.href = `edit.html?id=${productoId}`;
}



//Kardex
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kardexForm');
    const resultsTable = document.getElementById('resultsTable');
    const tbody = resultsTable.querySelector('tbody');

    //Evento submit en el formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const categoria = document.getElementById('categoria').value;
        const fechaDesde = document.getElementById('fechaDesde').value;
        const fechaHasta = document.getElementById('fechaHasta').value;

        if (!categoria) {
            alert('Por favor, selecciona una categoría.');
            return;
        }

        try {
            let url = `/kardexCat?categoria=${categoria}`;

            if (fechaDesde) {
                url += `&fechaDesde=${fechaDesde}`;
            }
            if (fechaHasta) {
                url += `&fechaHasta=${fechaHasta}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error al consultar el servidor.');
            }

            const data = await response.json();
            renderResults(data);
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="8">Error al obtener los datos.</td></tr>';
        }
    });

    // Función para renderizar los resultados en la tabla
    function renderResults(data) {
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No se encontraron resultados.</td></tr>';
            resultsTable.style.display = 'none';
            return;
        }

        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.Periodo}</td>
                <td>${row.Categoria}</td>
                <td>${row.Producto}</td>
                <td>${row.Valor_Unitario_Entrada}</td>
                <td>${row.Valor_Unitario_Salida}</td>
                <td>${row.Entrada_Cantidad}</td>
                <td>${row.Entrada_Total}</td>
                <td>${row.Salida_Cantidad}</td>
                <td>${row.Salida_Total}</td>
                <td>${row.Saldo_Cantidad}</td>
                <td>${row.Saldo_Total}</td>
            `;
            tbody.appendChild(tr);
        });

        resultsTable.style.display = 'table';
    }
});

function accesoDenegado() {
    const cuerpo = document.getElementById('admin'); 
    cuerpo.innerHTML = `
        <div class="text-center mt-5">
            <h1>Acceso Denegado</h1>
        </div>
    `;
}