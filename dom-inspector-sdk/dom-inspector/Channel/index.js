/**
 * 创建一个通信通道，当构造的时候监听self上的message
 * 只监听一次，接收ports，然后保存到this.ports上，通信的时候通过this.ports[0].postMessage发送消息
 * 这是一个类，通过new Channel()创建一个实例，请使用js构建这个类
 */
export default class Channel {
  #port = null;

  #onmessage = () => {};
  #onmessageerror = () => {};

  #handleMessageReceived = (event) => {
    if (!event.data && event.ports.length) {
      event.stopImmediatePropagation();
    }

    console.log("Get Port!!!", event.ports);
    if (event.ports.length) {
      this.#port = event.ports[0];

      this.#port.onmessage = (...args) => {
        this.#onmessage(...args);
      };
      this.#port.onmessageerror = (...args) => {
        this.#onmessageerror(...args);
      };
    }
  };

  constructor() {
    self.addEventListener("message", this.#handleMessageReceived, {
      once: true,
    });
  }

  postMessage(message) {
    if (!this.#port) {
      throw new Error("No ports available");
    }
    this.#port.postMessage(message);
  }

  onMessage(callback) {
    this.#onmessage = callback;
  }

  onMessageError(callback) {
    this.#onmessageerror = callback;
  }

  close() {
    this.#port?.close();
  }
}
