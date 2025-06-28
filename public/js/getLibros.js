// Asignar evento a cada botón de categoría en index.html y catalogo.html
document.querySelectorAll('.button-container button').forEach(button => {
    button.addEventListener('click', () => {
        const categoria = button.textContent.trim();
        window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoria)}`;
    });
});

// para obtener el valor de un parámetro en la URL
function getParametroURL(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

//  cargar los productos de una categoría o realizar una búsqueda
async function cargarProductos(categoria, searchQuery) {
    try {
        let url = `/api/productos/filtrar?categoria=${encodeURIComponent(categoria)}`;
        if (searchQuery) {
            url = `/api/productos/buscar?search=${searchQuery}`;  // la búsqueda
        }
        const response = await fetch(url);
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// mostrar los productos en la página
function mostrarProductos(productos) {
    const productList = document.querySelector('.product-list');
    productList.innerHTML = ''; // esto limpia el contenido anterior

    if (!productos || productos.length === 0) {
        productList.innerHTML = '<h1 style="color: white;">La búsqueda no ha devuelto ningún resultado.</h1>';
        return; 
    }
    
    productos.forEach(producto => {
        const productoItem = document.createElement('div');
        productoItem.classList.add('product-item');
        productoItem.innerHTML = `
            <a href="libro.html?id=${producto.ID}">
                <img src="img/${producto.IMG}" alt="${producto.Nombre}">
            </a>
            <p>${producto.Nombre}</p>
            <p>S/. ${producto.Nombre}</p>
        `;
        productList.appendChild(productoItem);
    });
}

// verifica que estamos en catalogo.html antes de ejecutar el código de carga
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('catalogo.html')) {
        const categoria = getParametroURL('categoria') || 'Polos & Tops';  // por defecto
        const searchQuery = getParametroURL('search');  // parámetro de búsqueda
        cargarProductos(categoria, searchQuery);  // Cargar los productos filtrados por categoría y/o búsqueda
    }
});







