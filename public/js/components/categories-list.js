class ListaCategorias extends HTMLElement {
  async connectedCallback() {
    const res = await fetch('/components/categories-list.html');
    const html = await res.text();
    this.innerHTML = html;
    this.dispatchEvent(new CustomEvent("categories-ready", { bubbles: true }));
  }
}

customElements.define('app-categories-list', ListaCategorias);
