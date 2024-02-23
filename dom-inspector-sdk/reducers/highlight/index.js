import { highlightElementAtPoint } from "../../utils/element.js";

export default function (type, message) {
  switch (type) {
    case "highlightElementAtPoint": {
      const { mx, my } = message;
      const frame = this.getIframe();
      const uniqueId = this.getUniqueId();
      const { svgPath, targetElements } = highlightElementAtPoint(
        mx,
        my,
        frame,
        uniqueId
      );
      // 如果没有选中元素，就保持原样
      if (!svgPath) {
        return;
      }
      // 保存目标元素
      this.setTargetElements(targetElements);
      // 将svgPath传递给iframe
      const channel = this.getChannel();
      channel.postMessage({
        type: "svgPath",
        svgPath,
      });
      break;
    }
  }
}
