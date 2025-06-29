// obtener el carrito de la sesión activa
async function cargarCarrito() {
    try {
        // verificar si el usuario está logueado
        const perfilResponse = await fetch('/api/auth/perfil');
        if (!perfilResponse.ok) {
            mostrarMensajeIniciarSesion();
            return;
        }

        const perfil = await perfilResponse.json();
        const usuarioID = perfil.id;

        // obtener los detalles del carrito del usuario
        const carritoResponse = await fetch(`/api/carrito/${usuarioID}`);
        if (!carritoResponse.ok) {
            throw new Error('No se pudo obtener el carrito');
        }

        const carrito = await carritoResponse.json();

        mostrarCarrito(carrito);
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

// mostrar el carrito en la tabla
function mostrarCarrito(carrito) {
    const carritoBody = document.getElementById('cartTableBody');
    carritoBody.innerHTML = '';  

    if (carrito.length === 0) {
        carritoBody.innerHTML = `<tr><td colspan="6" class="text-center">AÚN NO HAY PRODUCTOS EN TU CARRITO, ¡EXPLORA NUESTRA TIENDA!</td></tr>`;
    } else {
        carrito.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="img/${item.IMG}" alt="${item.Titulo}" class="img-thumbnail" width="50"></td>
                <td>${item.Titulo}</td>
                <td>S/ ${item.Precio}</td>
                <td>${item.Cantidad}</td>
                <td>S/ ${item.Precio * item.Cantidad}</td>
                <td><button class="btn btn-danger" onclick="eliminarDelCarrito(${item.DetalleID})">Eliminar</button></td>
            `;
            carritoBody.appendChild(row);
        });

        // el total
        const total = carrito.reduce((sum, item) => sum + (item.Precio * item.Cantidad), 0);
        document.querySelector('.ab-2').textContent = `S/ ${total.toFixed(2)}`;
    }
}

// función para eliminar un producto del carrito
async function eliminarDelCarrito(detalleID) {
    try {
        const response = await fetch(`/api/carrito/eliminar/${detalleID}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Producto eliminado del carrito');
            cargarCarrito();  
        } else {
            alert('Hubo un problema al eliminar el producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        alert('Hubo un problema al eliminar el producto');
    }
}

// cargar el carrito cuando la página se abra
document.addEventListener('DOMContentLoaded', cargarCarrito);

// comprar
document.addEventListener('DOMContentLoaded', () => {
    const comprarButton = document.getElementById('comprarButton');
    if (comprarButton) {
        comprarButton.addEventListener('click', finalizarCompra);
    }
});

async function finalizarCompra() {
    const carritoID = await obtenerCarritoID();
    if (!carritoID) {
        console.error('No se encontró el carrito');
        alert('Tu carrito está vacío. No puedes realizar la compra.');
        return; 
    }

    const productosCarrito = await obtenerProductosCarrito(carritoID);
    if (productosCarrito.length === 0) {
        alert('Tu carrito está vacío. No puedes realizar la compra.');
        return; 
    }

    try {
        const response = await fetch(`/api/carrito/${carritoID}/finalizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'Finalizado' })
        });

        if (response.ok) {
            alert('¡Compra finalizada exitosamente!');
            window.location.href = '/carrito.html'; 
        } else {
            console.error('Error al finalizar la compra');
            alert('Hubo un problema al finalizar la compra');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud de finalizar compra:', error);
    }
}

async function obtenerCarritoID() {
    try {
        const response = await fetch('/api/carrito/carrito-usuario');
        if (response.ok) {
            const data = await response.json();
            return data.carritoID;
        } else {
            console.error('No se encontró el carrito');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        return null;
    }
}

// obtener los productos del carrito
async function obtenerProductosCarrito(carritoID) {
    try {
        const response = await fetch(`/api/carrito/${carritoID}/productos`);
        if (response.ok) {
            const data = await response.json();
            return data.productos;  // retorna la lista de productos del carrito
        } else {
            console.error('No se encontraron productos en el carrito');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener los productos del carrito:', error);
        return [];
    }
}

function mostrarMensajeIniciarSesion() {
    const cartContainer = document.querySelector('.container'); 
    cartContainer.innerHTML = `
        <div class="text-center mt-5">
            <h3>Debes iniciar sesión para continuar con tus compras</h3>
            <button class="btn btn-primary mt-3" onclick="window.location.href='login.html'">
                Iniciar Sesión
            </button>
        </div>
    `;
}



