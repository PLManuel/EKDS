class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "description", "price", "image"];
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

    const { title, description, price, image } = this.attributesData;

    const imgEl = this.querySelector(".product-image");
    if (imgEl) {
      imgEl.src = image || "/img/placeholder.jpg";
      imgEl.alt = title || "Imagen del producto";
    }

    const titleEl = this.querySelector(".product-title");
    if (titleEl) titleEl.textContent = title || "Producto";

    const descEl = this.querySelector(".product-description");
    if (descEl) descEl.textContent = description || "";

    const priceEl = this.querySelector(".product-price");
    if (priceEl) priceEl.textContent = `$${parseFloat(price || 0).toFixed(2)}`;
  }
}

customElements.define("product-card", ProductCard);
