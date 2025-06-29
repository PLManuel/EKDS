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
  document.getElementById('productImage').src = `img/${producto.Imagen}`;
  document.getElementById('productName').textContent = producto.Nombre;
  document.getElementById('productSize').textContent = producto.Talla;
  document.getElementById('productBrand').innerHTML = producto.Marca;
  document.getElementById('productDescription').textContent = producto.Descripcion;
  document.getElementById('productPrice').textContent = `S/. ${producto.Precio}`;
  document.getElementById('productStock').textContent = `Disponible: ${producto.Stock} unidades`;
  const quantityInput = document.getElementById('quantity');
  quantityInput.max = producto.Stock;

  const agregarBtn = document.getElementById('btnAgregarCarrito');
  if (agregarBtn) {
    agregarBtn.addEventListener('click', () => {
      const cantidad = parseInt(quantityInput.value, 10);
      if (isNaN(cantidad) || cantidad < 1) {
        alert('Cantidad inválida');
        return;
      }
      agregarAlCarrito(producto, cantidad);
    });
  }
}

async function agregarAlCarrito(producto, cantidad) {
  try {
    const responsePerfil = await fetch('/api/auth/perfil');
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
    window.location.href = "/"
  } catch (error) {
    console.error('Error al añadir o actualizar al carrito:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const productoID = getParametroURL('id');
  if (productoID) {
    cargarProducto(productoID);
  } else {
    console.error('No se ha proporcionado un ID de producto en la URL');
  }

  const quantityInput = document.getElementById("quantity");
  const [minusBtn, plusBtn] = document.querySelectorAll(".quantity-btn");

  minusBtn.addEventListener("click", () => {
    let current = parseInt(quantityInput.value, 10);
    if (current > parseInt(quantityInput.min)) {
      quantityInput.value = current - 1;
    }
  });

  plusBtn.addEventListener("click", () => {
    let current = parseInt(quantityInput.value, 10);
    const max = parseInt(quantityInput.max);
    if (current < max) {
      quantityInput.value = current + 1;
    }
  });
});