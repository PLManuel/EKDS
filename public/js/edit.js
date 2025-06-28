// Obtener el ID del producto desde la URL
const params = new URLSearchParams(window.location.search);
const productoId = params.get("id");  // Suponemos que la URL es algo como edit.html?id=1

// Cargar los datos del producto seleccionado
window.onload = async () => {
    try {
        const response = await fetch(`/api/productos/${productoId}`);
        const producto = await response.json();
        
        // Rellenar el formulario con los datos del producto
        document.getElementById('nombre').value = producto.Nombre;
        document.getElementById('marca').value = producto.Marca;
        document.getElementById('descripcion').value = producto.Descripcion;
        document.getElementById('precioCompra').value = producto.PrecioCompra;
        document.getElementById('precio').value = producto.Precio;
        document.getElementById('stock').value = producto.Stock;
        document.getElementById('img').value = producto.IMG;
        document.getElementById('categoria').value = producto.Categoria;
        document.getElementById('talla').value = producto.Talla;
    } catch (error) {
        console.error('Error al cargar el producto:', error);
    }
};

// Función para guardar los cambios
document.getElementById('formEditarProducto').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productoActualizado = {
        nombre: document.getElementById('nombre').value,
        marca: document.getElementById('marca').value,
        descripcion: document.getElementById('descripcion').value,
        precioCompra: document.getElementById('precioCompra').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        img: document.getElementById('img').value,
        categoria: document.getElementById('categoria').value,
        talla: document.getElementById('talla').value
    };

    try {
        const response = await fetch(`/api/productos/update/${productoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoActualizado)
        });

        if (response.ok) {
            alert('Producto actualizado correctamente.');
            window.location.href = 'admin.html';  // Redirige a la página de admin después de guardar
        } else {
            alert('Error al actualizar el producto.');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
    }
});
