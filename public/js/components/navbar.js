class Navbar extends HTMLElement {
  async connectedCallback() {
    const res = await fetch('/components/navbar.html');
    const html = await res.text();
    this.innerHTML = html;
    this.dispatchEvent(new CustomEvent("navbar-ready", { bubbles: true }));
  }
}

customElements.define('app-navbar', Navbar);
