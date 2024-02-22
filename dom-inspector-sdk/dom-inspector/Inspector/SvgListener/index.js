export default class SvgListener {
  #on = false;
  #timer = undefined;
  #mx = 0;
  #my = 0;
  #channel = null;
  #abortController = new AbortController();
  constructor(channel) {
    this.#channel = channel;
  }

  #onTimer() {
    this.#timer = undefined;
    this.#channel.postMessage({
      type: "highlightElementAtPoint",
      mx: this.#mx,
      my: this.#my,
    });
  }

  #onHover(ev) {
    this.#mx = ev.clientX;
    this.#my = ev.clientY;
    if (this.#timer === undefined) {
      this.#timer = self.requestAnimationFrame(this.#onTimer.bind(this));
    }
  }

  toggle(state) {
    if (state === this.#on) {
      return;
    }
    this.#on = state;
    if (this.#on) {
      document.addEventListener("mousemove", this.#onHover.bind(this), {
        passive: true,
        signal: this.#abortController.signal,
      });
      return;
    }
    this.#abortController.abort();
    if (this.#timer !== undefined) {
      self.cancelAnimationFrame(this.#timer);
      this.#timer = undefined;
    }
    this.#abortController = new AbortController();
  }
}
