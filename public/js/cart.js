import "./components/cart-item.js"

document.addEventListener('DOMContentLoaded', cargarCarrito);

async function cargarCarrito() {
  try {
    const cartContent = document.getElementById("cart-content")
    const cartNoSesion = document.getElementById("cart-no-sesion")
    const perfilResponse = await fetch('/api/auth/perfil');
    if (!perfilResponse.ok) {
      cartContent.classList.add("hidden");
      cartNoSesion.classList.remove("hidden")
    }

    const perfil = await perfilResponse.json();
    const usuarioID = perfil.id;

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

function mostrarCarrito(carrito) {
  const cartTable = document.getElementById('cartTableBody');
  cartTable.innerHTML = ''; // Limpiar antes de volver a llenar

  if (!carrito || carrito.length === 0) {
    cartTable.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">AÚN NO HAY PRODUCTOS EN TU CARRITO, ¡EXPLORA NUESTRA TIENDA!</td>
      </tr>`;
    document.getElementById('cantidadTotal').textContent = '0';
    document.getElementById('subtotal').textContent = 'S/. 0.00';
    document.getElementById('total').textContent = 'S/. 0.00';
    return;
  }

  let cantidadTotal = 0;
  let total = 0;

  carrito.forEach(item => {
    const subTotal = item.Precio * item.Cantidad;

    const cartItem = document.createElement('cart-item');
    cartItem.setAttribute('image', `img/${item.Imagen}`);
    cartItem.setAttribute('name', item.Nombre);
    cartItem.setAttribute('brand', item.Marca || 'EKDS');
    cartItem.setAttribute('size', item.Talla || 'M');
    cartItem.setAttribute('quantity', item.Cantidad);
    cartItem.setAttribute('price', item.Precio);
    cartItem.setAttribute('sub', subTotal.toFixed(2));

    cartTable.appendChild(cartItem);

    cantidadTotal += item.Cantidad;
    total += subTotal;
  });

  document.getElementById('cantidadTotal').textContent = cantidadTotal;
  document.getElementById('subtotal').textContent = `S/. ${total.toFixed(2)}`;
  document.getElementById('total').textContent = `S/. ${total.toFixed(2)}`;
}
