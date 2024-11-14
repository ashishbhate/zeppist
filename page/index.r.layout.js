import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
  DEFAULT_COLOR,
  DEFAULT_COLOR_TRANSPARENT,
} from "../utils/config/constants";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../utils/config/device";

widthFromY = (r, y) => {
  return Math.sqrt((r * r) - (r - y) * (r - y)) * 2
}

const topTextY = px(15)
const topTextWfromY = widthFromY(DEVICE_HEIGHT / 2, topTextY)
export const TOP_TEXT = {
  x: DEVICE_HEIGHT / 2 - topTextWfromY / 2,
  y: topTextY,
  w: topTextWfromY,
  h: px(50),
  color: 0xffffff,
  text_size: px(16),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const FETCH_TODAY_BUTTON = {
  x: px(0),
  y: DEVICE_HEIGHT - px(50),
  w: DEVICE_WIDTH,
  h: px(50),
  text_size: px(24),
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "Fetch Today",
};
