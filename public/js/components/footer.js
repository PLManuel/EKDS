class Footer extends HTMLElement {
  async connectedCallback() {
    const res = await fetch('/components/footer.html');
    const html = await res.text();
    this.innerHTML = html;
  }
}

customElements.define('app-footer', Footer);
