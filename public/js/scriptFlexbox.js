document.addEventListener('DOMContentLoaded', function() {
    const libreriaMenu = document.querySelector('.tienda-menu');   
    const navLinks = document.querySelector('.button-container');

    libreriaMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});