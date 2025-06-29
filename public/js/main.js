import "./components/navbar.js";
import "./components/footer.js";
import "./components/product-card.js"
import "./components/categories-list.js"

document.addEventListener("navbar-ready", () => {
  const searchInput = document.querySelector("app-navbar .search-input");

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
          window.location.href = `catalogo.html?search=${encodeURIComponent(searchQuery)}`;
        }
      }
    });
  }
});

document.addEventListener("categories-ready", () => {
  document.querySelectorAll('.categories-list button').forEach(button => {
    button.addEventListener('click', () => {
      const categoria = button.textContent.trim();
      window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoria)}`;
    });
  });
})

function getParametroURL(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function cargarProductos(categoria, searchQuery) {
  try {
    let url = `/api/productos/filtrar?categoria=${encodeURIComponent(categoria)}`;
    if (searchQuery) {
      url = `/api/productos/buscar?search=${encodeURIComponent(searchQuery)}`;
    }

    const res = await fetch(url);
    const productos = await res.json();

    mostrarProductos(productos);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

function mostrarProductos(productos) {
  const productList = document.querySelector(".product-list");
  productList.innerHTML = "";

  if (!productos || productos.length === 0) {
    productList.innerHTML = `
      <p class="text-center col-span-full text-gray-500 text-lg">
        La búsqueda no ha devuelto ningún resultado.
      </p>`;
    return;
  }

  productos.forEach((producto) => {
    const card = document.createElement("product-card");
    card.setAttribute("title", producto.Nombre);
    card.setAttribute("description", producto.Descripcion || "");
    card.setAttribute("price", producto.Precio || "0.00");
    card.setAttribute("image", `/img/${producto.Imagen || "placeholder.jpg"}`);
    productList.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("catalogo.html")) {
    const categoria = getParametroURL("categoria") || "Polos & Tops";
    const searchQuery = getParametroURL("search");
    cargarProductos(categoria, searchQuery);
  }
});
