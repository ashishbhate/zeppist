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

// 15 --- Page Indicator Start ---
//
// 25 --- Page Indicator End ---
// 40 --- Fetch Status Start ---
//
// 90 --- Fetch Status End ---
// 100 --- Sync Status Start ---
//
// 220 --- Sync Status End ---
// 240 --- Button Start ---
//
// 360 --- Button End ---

const frsY = DEVICE_HEIGHT / 4 - px(50)
const frsWfromY = widthFromY(DEVICE_HEIGHT / 2, frsY)
export const FETCH_RESULT_STATUS = {
  x: DEVICE_HEIGHT / 2 - frsWfromY / 2,
  y: frsY,
  w: frsWfromY,
  h: px(50),
  color: 0xffffff,
  text_size: px(34),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

const frtY = DEVICE_HEIGHT / 2 - px(80)
const frtWfromY = widthFromY(DEVICE_HEIGHT / 2, frtY)
export const FETCH_RESULT_TEXT = {
  x: DEVICE_HEIGHT / 2 - frtWfromY / 2,
  y: frtY,
  w: frtWfromY,
  h: px(120),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const FETCH_TODAY_BUTTON = {
  x: px(0),
  y: DEVICE_HEIGHT - px(120),
  w: DEVICE_WIDTH,
  h: px(120),
  text_size: px(38),
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "Fetch Today",
};
