document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[data-tab-container]").addEventListener("click", (e) => {
    const tab = e.target.closest("button[data-tab]")
    if (!tab) return

    const selected = tab.dataset.tab
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.classList.toggle("tab-active", btn.dataset.tab === selected)
      btn.classList.toggle("tab-inactive", btn.dataset.tab !== selected)
    })

    document.querySelectorAll("[data-form]").forEach((form) => {
      form.classList.toggle("active", form.dataset.form === selected)
    })
  })

  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".relative").querySelector("[data-password]")
      const icon = btn.querySelector("[data-password-icon]")
      const isHidden = input.type === "password"

      input.type = isHidden ? "text" : "password"
      icon.className = isHidden
        ? "fas fa-eye-slash text-gray-400 hover:text-wood transition-colors"
        : "fas fa-eye text-gray-400 hover:text-wood transition-colors"
    })
  })

  const handleSubmit = (formSelector, endpoint, onSuccess) => {
    const form = document.querySelector(formSelector)
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new URLSearchParams(new FormData(e.target)),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        const result = await response.json()
        response.ok ? onSuccess(result) : alert(result.message || "Error")
      } catch {
        alert("Error de conexión.")
      }
    })
  }

  handleSubmit("[data-form-login]", "/api/auth/login", () => {
    window.location.href = "/index.html"
  })

  handleSubmit("[data-form-register]", "/api/auth/register", (res) => {
    alert(res.message)
    document.querySelector('[data-tab="login"]').click()
  })
})
