import Channel from "./Channel/index.js";
import Inspector from "./Inspector/index.js";

import { $stor } from "../utils/dom.js";

const svgRoot = $stor("svg");
const svgOcean = svgRoot.children[0];
const svgIslands = svgRoot.children[1];
const NoPaths = "M0 0";

const channel = new Channel();

// 监听
channel.onMessage((event) => {
  switch (event.data.type) {
    case "svgPath": {
      const { svgPath } = event.data;
      let { ocean, islands } = svgPath;
      ocean += islands;
      svgOcean.setAttribute("d", ocean);
      svgIslands.setAttribute("d", islands || NoPaths);
      break;
    }
  }
});

const inspector = new Inspector(channel);
// 开始监听鼠标移动
inspector.start();
