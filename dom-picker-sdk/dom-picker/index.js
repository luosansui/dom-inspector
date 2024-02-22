import { highlightElementAtPoint } from "./utils.js";

const svgListening = (() => {
  let on = false;
  let timer;
  let mx = 0,
    my = 0;

  const onTimer = () => {
    timer = undefined;
    const result = highlightElementAtPoint(mx, my);
    console.log(result);
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
