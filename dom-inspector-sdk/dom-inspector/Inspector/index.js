import SvgListener from "./SvgListener/index.js";

export default class Inspector {
  #channel = null;
  #SvgListener = null;
  constructor(channel) {
    this.#channel = channel;
    this.#SvgListener = new SvgListener(channel);
  }

  startListen = () => {
    this.#SvgListener.toggleMousemoveListen(true);
    this.#SvgListener.toggleClickListen(true);
  };

  stopListen = () => {
    this.#SvgListener.toggleMousemoveListen(false);
    this.#SvgListener.toggleClickListen(false);
  };

  destroy = () => {
    this.#SvgListener.stopAllListen();
  };
}
