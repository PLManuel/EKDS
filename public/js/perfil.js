document.addEventListener('DOMContentLoaded', function () {
    const userIcon = document.getElementById('user');   
    const cartIcon = document.getElementById('cart');
    const userName = document.querySelector('.usuario');

    fetch('/perfil')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                userName.style.display = 'flex'
                document.getElementById('userDropdown').innerText = `${data.username}`;

                // ocultar icono usuario
                userIcon.style.display = 'none';

                if(data.tipo_usuario === 'admin') {
                    document.getElementById('crud').innerText = `Admin`;
                    
                    // ocultar icono carrito
                    cartIcon.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    // mostrar u ocultar el menú desplegable
    userDropdown.addEventListener('click', function(event) {
        event.preventDefault(); // evvitar que el enlace redirija
        const rect = userDropdown.getBoundingClientRect(); // obtener posición de userDropdown

        // colocar el menú debajo deuserDropdown
        dropdownMenu.style.top = rect.bottom + window.scrollY + 'px'; // coordenada Y 
        dropdownMenu.style.left = rect.left + 'px'; // coordenada X 
    
        // visibilidad del menú
        if (dropdownMenu.style.display === 'none') {
            dropdownMenu.style.display = 'block';
        } else {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // ocultar el menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        if (!userDropdown.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });    
})

    