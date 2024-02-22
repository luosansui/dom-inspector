import { highlightElementAtPoint } from "../../utils.js";

export default function (type, message) {
  switch (type) {
    case "highlightElementAtPoint":
      const frame = this.getIframe();
      const uniqueId = this.getUniqueId();
      const svgPath = highlightElementAtPoint(
        message.mx,
        message.my,
        frame,
        uniqueId
      );
      // 将svgPath传递给iframe
      const channel = this.getChannel();
      channel.postMessage({
        type: "svgPath",
        svgPath,
      });
      break;
  }
}
