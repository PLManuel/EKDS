import "./components/hero.js"

class AutoCarousel {
  constructor({
    slideSelector = ".carousel-slide",
    indicatorSelector = ".carousel-indicator",
    carouselId = "carousel",
    interval = 6000,
  } = {}) {
    this.slides = document.querySelectorAll(slideSelector)
    this.indicators = document.querySelectorAll(indicatorSelector)
    this.carousel = document.getElementById(carouselId)
    this.current = 0
    this.interval = interval
    this.timer = null

    this.init()
  }

  init() {
    if (!this.slides.length) return

    this.show(this.current)
    this.start()

    this.carousel?.addEventListener("mouseenter", () => this.pause())
    this.carousel?.addEventListener("mouseleave", () => this.start())
  }

  show(index) {
    this.slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-100", i === index)
      slide.classList.toggle("opacity-0", i !== index)
    })

    this.indicators.forEach((dot, i) => {
      dot.classList.toggle("opacity-100", i === index)
      dot.classList.toggle("opacity-50", i !== index)
    })

    this.current = index
  }

  next() {
    this.show((this.current + 1) % this.slides.length)
  }

  start() {
    this.pause()
    this.timer = setInterval(() => this.next(), this.interval)
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AutoCarousel()
})

window.addEventListener("load", () => {
  const hero = document.querySelector(".text-center")

  if (hero) {
    hero.style.opacity = "0"
    hero.style.transform = "translateY(30px)"
    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.style.transition =
          "opacity 1s ease-out, transform 1s ease-out"
        hero.style.opacity = "1"
        hero.style.transform = "translateY(0)"
      }, 100)
    })
  }
})