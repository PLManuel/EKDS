class Hero extends HTMLElement {
  async connectedCallback() {
    const res = await fetch('/components/hero.html');
    const html = await res.text();
    this.innerHTML = html;
  }
}

customElements.define('app-hero', Hero);
