class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "description", "price", "image", "id"];
  }

  constructor() {
    super();
    this.isRendered = false;
    this.attributesData = {};
  }

  async connectedCallback() {
    const res = await fetch("/components/product-card.html");
    const template = await res.text();
    this.innerHTML = template;

    this.isRendered = true;

    this.updateContent();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.attributesData[name] = newValue;
    if (this.isRendered) {
      this.updateContent();
    }
  }

  updateContent() {
    if (!this.isRendered) return;

    const { title, description, price, image, id } = this.attributesData;

    const imgEl = this.querySelector(".product-image");
    if (imgEl) {
      imgEl.src = image || "/img/imagen.jpg";
      imgEl.alt = title || "Imagen del producto";
    }

    const titleEl = this.querySelector(".product-title");
    if (titleEl) titleEl.textContent = title || "Producto";

    const descEl = this.querySelector(".product-description");
    if (descEl) descEl.textContent = description || "";

    const priceEl = this.querySelector(".product-price");
    if (priceEl) priceEl.textContent = `S/. ${parseFloat(price || 0).toFixed(2)}`;

    const linkEl = this.querySelector("a");
    if (linkEl && id) {
      linkEl.href = `../producto.html?id=${id}`;
    }
  }
}

customElements.define("product-card", ProductCard);
