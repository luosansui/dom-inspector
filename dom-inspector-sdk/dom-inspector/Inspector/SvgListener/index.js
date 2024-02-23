export default class SvgListener {
  #mousemove = {
    on: false,
    timer: undefined,
    mx: 0,
    my: 0,
  };

  #click = {
    on: false,
  };

  #channel = null;
  #abortController = new AbortController();

  constructor(channel) {
    this.#channel = channel;
  }
  /**----------------------mousemove------------------------------ */
  #onMousemoveTimer = () => {
    this.#mousemove.timer = undefined;
    this.#channel.postMessage({
      type: "highlightElementAtPoint",
      mx: this.#mousemove.mx,
      my: this.#mousemove.my,
    });
  };

  #onMousemoveHover = (ev) => {
    this.#mousemove.mx = ev.clientX;
    this.#mousemove.my = ev.clientY;
    if (this.#mousemove.timer === undefined) {
      this.#mousemove.timer = self.requestAnimationFrame(
        this.#onMousemoveTimer
      );
    }
  };

  toggleMousemoveListen = (state) => {
    // 如果状态没有改变，直接返回

    if (state === this.#mousemove.on) {
      return;
    }
    // 如果状态改变，更新状态（state为undefined时，取反）
    this.#mousemove.on = state === undefined ? !this.#mousemove.on : state;

    if (this.#mousemove.on) {
      self.addEventListener("mousemove", this.#onMousemoveHover, {
        passive: true,
        signal: this.#abortController.signal,
      });
      return;
    }

    this.#abortController.abort();
    if (this.#mousemove.timer !== undefined) {
      self.cancelAnimationFrame(this.#mousemove.timer);
      this.#mousemove.timer = undefined;
    }
    this.#abortController = new AbortController();
  };

  /**----------------------click------------------------------ */

  #handleClick = () => {
    this.toggleMousemoveListen();
  };

  toggleClickListen = (state) => {
    if (state === this.#click.on) {
      return;
    }
    this.#click.on = state === undefined ? !this.#click.on : state;

    if (this.#click.on) {
      self.addEventListener("click", this.#handleClick, {
        passive: true,
      });
    } else {
      self.removeEventListener("click", this.#handleClick, {
        passive: true,
      });
    }
  };

  stopAllListen = () => {
    this.toggleClickListen(false);
    this.toggleMousemoveListen(false);
  };
}
