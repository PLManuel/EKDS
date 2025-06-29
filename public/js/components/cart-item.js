class CartItem extends HTMLElement {
  static get observedAttributes() {
    return ["image", "name", "brand", "size", "quantity", "price", "sub"];
  }

  constructor() {
    super();
    this.isRendered = false;
    this.attributesData = {};
  }

  async connectedCallback() {
    const res = await fetch("/components/cart-item.html");
    const template = await res.text();

    const temp = document.createElement("tbody");
    temp.innerHTML = template.trim();
    const tr = temp.querySelector("tr");

    if (tr) {
      this.replaceWith(tr);
      this.$el = tr;
      this.isRendered = true;
      this.updateContent();
    } else {
      console.error("La plantilla no contiene un <tr>");
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.attributesData[name] = newValue;
    if (this.isRendered) {
      this.updateContent();
    }
  }

  updateContent() {
    if (!this.isRendered || !this.$el) return;

    const { image, name, brand, size, quantity, price, sub } = this.attributesData;

    this.$el.querySelector(".product-image")?.setAttribute("src", image || "/img/imagen.jpg");
    this.$el.querySelector(".product-image")?.setAttribute("alt", name || "Imagen del producto");
    this.$el.querySelector(".product-name").textContent = name || "Producto";
    this.$el.querySelector(".product-brand").textContent = brand || "";
    this.$el.querySelector(".product-size").textContent = size || "";
    this.$el.querySelector(".product-quantity").textContent = quantity || "";
    this.$el.querySelector(".product-price").textContent = `S/. ${parseFloat(price || 0).toFixed(2)}`;
    this.$el.querySelector(".product-sub").textContent = `S/. ${parseFloat(sub || 0).toFixed(2)}`;
  }
}

customElements.define("cart-item", CartItem);
