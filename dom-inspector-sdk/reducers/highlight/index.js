import { highlightElementAtPoint } from "../../utils.js";

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
