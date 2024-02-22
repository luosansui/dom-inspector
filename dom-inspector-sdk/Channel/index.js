export default class Channel {
  #port = null;
  constructor(port) {
    this.#port = port;
  }

  postMessage(message) {
    if (!this.#port) {
      throw new Error("No ports available");
    }
    this.#port.postMessage(message);
  }

  onMessage(callback) {
    this.#port.onmessage = callback;
  }

  onMessageError(callback) {
    this.#port.onmessageerror = callback;
  }
}
