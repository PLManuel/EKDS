function getParametroURL(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function cargarProducto(id) {
    try {
        const response = await fetch(`/api/productos/${id}`); 
        if (response.ok) {
            const producto = await response.json();
            mostrarProducto(producto);
        } else {
            console.error('Producto no encontrado');
        }
    } catch (error) {
        console.error('Error al cargar el producto:', error);
    }
}


function mostrarProducto(producto) {
    document.getElementById('productImage').src = `img/${producto.IMG}`;
    document.getElementById('productName').textContent = producto.Nombre;
    document.getElementById('productBrand').innerHTML = `Marca: <strong>${producto.Marca}</strong>`;
    document.getElementById('productDescription').textContent = producto.Descripcion;
    document.getElementById('productPrice').textContent = `Precio: S/. ${producto.Precio}`;
    const product = document.getElementById('product');
    const inputHTML = `
            <input type="number" id="productQuantity" 
                   min="1" max="${producto.Stock}" 
                   value="1">`;
    product.insertAdjacentHTML('beforeend', inputHTML);

    product.addEventListener('submit', async (e) => {
        e.preventDefault();

        const quantity = parseInt(document.getElementById('productQuantity').value);
        agregarAlCarrito(producto, quantity)
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const productoID = getParametroURL('id'); 
    if (productoID) {
        cargarProducto(productoID); 
    } else {
        console.error('No se ha proporcionado un ID de producto en la URL');
    }
});

///////////////////////////////////////////////////////////////////////////
async function agregarAlCarrito(producto, cantidad) {
    try {
        const responsePerfil = await fetch('/perfil');
        if (!responsePerfil.ok) {
            alert('No ha iniciado sesión');
            return;
        } 

        const perfil = await responsePerfil.json();
        const usuarioID = perfil.id;

        const carritoResponse = await fetch('/api/carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productoID: producto.ID,
                cantidad: cantidad,
                precioUnitario: producto.Precio,
                usuarioID: usuarioID
            })
        });

        if (!carritoResponse.ok) throw new Error('Error al añadir/actualizar producto en el carrito');

        alert('¡Producto añadido al carrito!');
    } catch (error) {
        console.error('Error al añadir o actualizar al carrito:', error);
    }
}



