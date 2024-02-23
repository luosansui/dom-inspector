/**
 * 该类主要逻辑是 self.addEventListener("scroll", this.#handleViewportChanged, {
      passive: true,
    });
    self.addEventListener("resize", this.#handleViewportChanged, {
      passive: true,
    });
    在install方法中启用，
    在uninstall方法中销毁
    同时它具有一个onCallback方法，定义了一个回调函数，用于处理视口变化事件
 */
export default class ViewChangeListener {
  #viewportChangedCallback = () => {};

  constructor(callback) {
    this.#viewportChangedCallback = callback;
  }

  #handleViewportChanged = () => {
    this.#viewportChangedCallback();
  };

  start() {
    self.addEventListener("scroll", this.#handleViewportChanged, {
      passive: true,
    });
    self.addEventListener("resize", this.#handleViewportChanged, {
      passive: true,
    });
  }

  stop() {
    self.removeEventListener("scroll", this.#handleViewportChanged, {
      passive: true,
    });
    self.removeEventListener("resize", this.#handleViewportChanged, {
      passive: true,
    });
  }

  onCallback(callback) {
    this.#viewportChangedCallback = callback;
    return this;
  }
}
