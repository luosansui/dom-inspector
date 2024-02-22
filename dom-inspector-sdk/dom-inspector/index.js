import Channel from "./Channel/index.js";
import { $stor } from "../utils/dom.js";

const channel = new Channel();

const svgRoot = $stor("svg");
const svgOcean = svgRoot.children[0];
const svgIslands = svgRoot.children[1];
const NoPaths = "M0 0";

channel.onMessage((event) => {
  switch (event.data.type) {
    case "svgPath": {
      const { svgPath } = event.data;
      if (!svgPath) {
        return;
      }
      let { ocean, islands } = svgPath;
      ocean += islands;
      svgOcean.setAttribute("d", ocean);
      svgIslands.setAttribute("d", islands || NoPaths);
      break;
    }
  }
});

const svgListening = (() => {
  let on = false;
  let timer;
  let mx = 0,
    my = 0;

  const onTimer = () => {
    timer = undefined;
    channel.postMessage({
      type: "highlightElementAtPoint",
      mx,
      my,
    });
  };

  const onHover = (ev) => {
    mx = ev.clientX;
    my = ev.clientY;
    if (timer === undefined) {
      timer = self.requestAnimationFrame(onTimer);
    }
  };

  return (state) => {
    if (state === on) {
      return;
    }
    on = state;
    if (on) {
      document.addEventListener("mousemove", onHover, { passive: true });
      return;
    }
    document.removeEventListener("mousemove", onHover, { passive: true });
    if (timer !== undefined) {
      self.cancelAnimationFrame(timer);
      timer = undefined;
    }
  };
})();

// 开始监听鼠标移动
svgListening(true);
