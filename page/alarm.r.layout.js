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

const atY = DEVICE_HEIGHT / 2 - px(140)
const atWfromY = widthFromY(DEVICE_HEIGHT / 2, atY)
export const ALARM_TEXT = {
  x: DEVICE_HEIGHT / 2 - atWfromY / 2,
  y: atY,
  w: atWfromY,
  h: px(200),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const BUTTON = {
  x: 0,
  y: DEVICE_HEIGHT - px(120),
  w: DEVICE_WIDTH,
  h: px(120),
  text_size: px(38),
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
};
