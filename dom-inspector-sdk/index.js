/**
 * 用与开启dom-inspector，为全局注入样式
 * 开启dom-inspector的方式是创建一个<iframe src=""></iframe>
 * 同时需要为iframe注入样式
 * 将其封装为一个类，方便使用
 */
import { randomToken } from "./utils.js";
import highlight from "./reducers/highlight/index.js";
import Channel from "./Channel/index.js";

export default class DomInspector {
  #iframe = null;
  #styleTag = null;
  #uniqueId = "";
  #channel = null;
  #reducers = [];

  getIframe() {
    return this.#iframe;
  }

  getUniqueId() {
    return this.#uniqueId;
  }

  getChannel() {
    return this.#channel;
  }

  // Initialize DomPicker
  init(token) {
    // 验证token
    if (!this.#verify(token)) {
      throw new Error("Invalid token");
    }

    // 生成一个唯一的id
    this.#uniqueId = `frame-${randomToken()}`;
    // 注册reducers
    this.#registerReducers([highlight]);

    // 创建iframe
    this.#createIframe();

    // 注入样式
    this.#injectStyle();
  }

  // Destroy DomPicker
  destroy() {
    if (this.#iframe) {
      document.body.removeChild(this.#iframe);
      this.#iframe = null;
    }
    if (this.#styleTag) {
      document.head.removeChild(this.#styleTag);
      this.#styleTag = null;
    }
    this.#uniqueId = "";
  }

  // Verify token
  #verify(token) {
    return true;
  }

  // Create iframe
  #createIframe() {
    this.#iframe = document.createElement("iframe");
    this.#iframe.src = "/dom-inspector-sdk/dom-inspector/index.html";
    this.#iframe.setAttribute(this.#uniqueId, "");
    document.documentElement.appendChild(this.#iframe);
    this.#waitFrameLoad();
  }

  // Wait iframe load
  #waitFrameLoad() {
    this.#iframe.addEventListener(
      "load",
      () => {
        // 设置iframe的属性及通信通道
        this.#iframe.setAttribute(`${this.#uniqueId}-loaded`, "");
        // iframe加载完成后通信才有意义，所以不会初始化就创建通信通道
        const messageChannel = new MessageChannel();
        // 向iframe发送通信端口
        this.#iframe.contentWindow.postMessage(
          null,
          new URL(this.#iframe.src).href,
          [messageChannel.port2]
        );
        // 创建主页面通信通道
        this.#channel = new Channel(messageChannel.port1);

        // 监听通信，收到消息后使用reducers处理iframe的通信内容
        this.#listenAndCallReducers();

        // 初始化svg的ocean(遮罩层)
        this.#initSvgOcean();
      },
      { once: true }
    );
  }

  // Call reducers
  #listenAndCallReducers() {
    this.#channel.onMessage((event) => {
      const { type, ...args } = event.data;
      this.#reducers.forEach((reducer) => {
        reducer(type, args);
      });
    });
  }

  // Inject style to iframe
  #injectStyle() {
    const pickerCSSStyle = [
      "background: transparent",
      "border: 0",
      "border-radius: 0",
      "box-shadow: none",
      "color-scheme: light dark",
      "display: block",
      "filter: none",
      "height: 100vh",
      "left: 0",
      "margin: 0",
      "max-height: none",
      "max-width: none",
      "min-height: unset",
      "min-width: unset",
      "opacity: 1",
      "outline: 0",
      "padding: 0",
      "pointer-events: auto",
      "position: fixed",
      "top: 0",
      "transform: none",
      "visibility: hidden",
      "width: 100%",
      "z-index: 2147483647",
      "",
    ].join(" !important;\n");

    const pickerCSS = `
      :root > [${this.#uniqueId}] {
          ${pickerCSSStyle}
      }
      :root > [${this.#uniqueId}-loaded] {
          visibility: visible !important;
      }
      :root [${this.#uniqueId}-clickblind] {
          pointer-events: none !important;
      }
    `;
    this.#styleTag = document.createElement("style");
    this.#styleTag.innerHTML = pickerCSS;
    document.head.appendChild(this.#styleTag);
  }

  // 注册reducers
  #registerReducers(reducers) {
    reducers.forEach((reducer) => {
      // 绑定iframe和uniqueId到reducer
      const reducerWithFrame = reducer.bind(this);
      this.#reducers.push(reducerWithFrame);
    });
  }

  // 初始化svg的ocean
  #initSvgOcean() {
    const ow = self.innerWidth;
    const oh = self.innerHeight;
    this.#channel.postMessage({
      type: "svgPath",
      svgPath: {
        ocean: `M0 0h${ow}v${oh}h-${ow}z`,
        islands: "",
      },
    });
  }
}
