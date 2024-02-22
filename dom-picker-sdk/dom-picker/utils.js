/**
 * 获取元素的尺寸和位置信息
 * @param { HTMLElement } elem 元素
 * @returns { DOMRect } 尺寸和位置信息
 */
const getElementBoundingClientRect = function (elem) {
  let rect =
    typeof elem.getBoundingClientRect === "function"
      ? elem.getBoundingClientRect()
      : { height: 0, left: 0, top: 0, width: 0 };

  // https://github.com/gorhill/uBlock/issues/1024
  // Try not returning an empty bounding rect.
  if (rect.width !== 0 && rect.height !== 0) {
    return rect;
  }
  if (elem.shadowRoot instanceof DocumentFragment) {
    return getElementBoundingClientRect(elem.shadowRoot);
  }

  let left = rect.left,
    right = left + rect.width,
    top = rect.top,
    bottom = top + rect.height;

  for (const child of elem.children) {
    rect = getElementBoundingClientRect(child);
    if (rect.width === 0 || rect.height === 0) {
      continue;
    }
    if (rect.left < left) {
      left = rect.left;
    }
    if (rect.right > right) {
      right = rect.right;
    }
    if (rect.top < top) {
      top = rect.top;
    }
    if (rect.bottom > bottom) {
      bottom = rect.bottom;
    }
  }

  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
};

const elementFromPoint = (() => {
  let lastX, lastY;

  return (x, y) => {
    if (x !== undefined) {
      lastX = x;
      lastY = y;
    } else if (lastX !== undefined) {
      x = lastX;
      y = lastY;
    } else {
      return null;
    }
    if (!pickerFrame) {
      return null;
    }
    const magicAttr = `${pickerUniqueId}-clickblind`;
    pickerFrame.setAttribute(magicAttr, "");
    let elem = document.elementFromPoint(x, y);
    if (
      elem === null /* to skip following tests */ ||
      elem === document.body ||
      elem === document.documentElement ||
      (pickerBootArgs.zap !== true &&
        noCosmeticFiltering &&
        resourceURLsFromElement(elem).length === 0)
    ) {
      elem = null;
    }
    // https://github.com/uBlockOrigin/uBlock-issues/issues/380
    pickerFrame.removeAttribute(magicAttr);
    return elem;
  };
})();

export const highlightElements = function (elems) {
  // To make mouse move handler more efficient
  if (elems.length === 0) {
    return;
  }

  const targetElements = [];

  const ow = self.innerWidth;
  const oh = self.innerHeight;
  const islands = [];

  for (const elem of elems) {
    targetElements.push(elem);
    const rect = getElementBoundingClientRect(elem);
    // Ignore offscreen areas
    if (
      rect.left > ow ||
      rect.top > oh ||
      rect.left + rect.width < 0 ||
      rect.top + rect.height < 0
    ) {
      continue;
    }
    islands.push(
      `M${rect.left} ${rect.top}h${rect.width}v${rect.height}h-${rect.width}z`
    );
  }

  const result = {
    ocean: `M0 0h${ow}v${oh}h-${ow}z`,
    islands: islands.join(""),
  };

  return result;
};

export const highlightElementAtPoint = function (mx, my) {
  const elem = elementFromPoint(mx, my);
  console.log("elem", elem);
  highlightElements(elem ? [elem] : []);
};

export const randomToken = () => {
  const n = Math.random();
  return (
    String.fromCharCode(n * 25 + 97) +
    Math.floor((0.25 + n * 0.75) * Number.MAX_SAFE_INTEGER)
      .toString(36)
      .slice(-8)
  );
};