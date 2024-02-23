/**
 * 用与开启dom-inspector，为全局注入样式
 * 开启dom-inspector的方式是创建一个<iframe src=""></iframe>
 * 同时需要为iframe注入样式
 * 将其封装为一个类，方便使用
 */
import { randomToken } from "./utils.js";
import highlight from "./reducers/highlight/index.js";
import Channel from "./Channel/index.js";
import { highlightElements } from "./utils.js";
import ViewChangeListener from "./ViewChangeListener/index.js";

export default class DomInspector {
  #iframe = null; // iframe
  #styleTag = null; // 样式标签
  #uniqueId = ""; // 唯一id
  #channel = null; // 通信通道
  #reducers = []; // 处理iframe通信的reducers
  #targetElements = []; // 保存目标元素
  #ViewChangeListener = new ViewChangeListener(); // 视口变化监听

  getIframe() {
    return this.#iframe;
  }

  getUniqueId() {
    return this.#uniqueId;
  }

  getChannel() {
    return this.#channel;
  }

  pushTargetElements(elem) {
    if (Array.isArray(elem)) {
      this.#targetElements = this.#targetElements.concat(elem);
    } else {
      this.#targetElements.push(elem);
    }
  }

  setTargetElements(elem) {
    if (!Array.isArray(elem)) {
      throw new Error("Invalid target elements");
    }
    this.#targetElements = elem;
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
    // 移除iframe
    document.body.removeChild(this.#iframe);
    this.#iframe = null;
    // 移除样式
    document.head.removeChild(this.#styleTag);
    this.#styleTag = null;
    // 清空reducers
    this.#reducers = [];
    // 清空目标元素
    this.#targetElements = [];
    // 关闭通信通道
    this.#channel.close();
    this.#channel = null;
    // 清空uniqueId
    this.#uniqueId = "";
    // 停止视口变化监听
    this.#ViewChangeListener.stop();
    this.ViewChange = null;
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

        // 绑定视口变化监听事件
        this.#ViewChangeListener
          .onCallback(() => {
            const { svgPath } = highlightElements(this.#targetElements);
            if (!svgPath) {
              return;
            }
            // 将svgPath传递给iframe
            this.#channel.postMessage({
              type: "svgPath",
              svgPath,
            });
          })
          .start();
      },
      { once: true }
    );
  }

  // Register reducers
  #registerReducers(reducers) {
    reducers.forEach((reducer) => {
      this.#reducers.push(reducer.bind(this));
    });
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
