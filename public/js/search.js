// Obtener el input de búsqueda
const searchInput = document.querySelector('.search-input');

// Añadir evento para el campo de búsqueda
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            // Redirigir a catalogo.html con el parámetro de búsqueda
            window.location.href = `catalogo.html?search=${encodeURIComponent(searchQuery)}`;
        }
    }
});
