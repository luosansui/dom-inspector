import SvgListener from "./SvgListener/index.js";

export default class Inspector {
  #SvgListener = null;
  #channel = null;
  constructor(channel) {
    this.#channel = channel;
    this.#SvgListener = new SvgListener(channel);
  }
  start() {
    this.#SvgListener.toggle(true);
  }
  pause() {
    this.#SvgListener.toggle(false);
  }
  destroy() {
    this.pause();
    this.#channel.close();
  }
}
