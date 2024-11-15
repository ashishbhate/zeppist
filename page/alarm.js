import { BasePage } from "@zeppos/zml/base-page";
import { back } from '@zos/router';
import { Vibrator, VIBRATOR_SCENE_STRONG_REMINDER } from '@zos/sensor';
import * as hmUI from "@zos/ui";
import {
    ALARM_TEXT, BUTTON
} from "zosLoader:./alarm.[pf].layout.js";

Page(
    BasePage({

        state: {},

        build() {
            const taskID = getApp().globalData.TRIGGERED_TASK_ID
            var title
            if (taskID) {
                title = getApp().globalData.TASK_BY_TASK_ID[taskID].title
            }
            if (!taskID || title == "") {
                const now = Date.now()
                for (const [key, value] of Object.entries(getApp().globalData.TASK_BY_TASK_ID)) {
                    if (value.due - 30 < now < value.due + 30) {
                        title = value.title
                        break
                    }
                }
            }
            if (title == "") {
                title = "missing info"
            }
            hmUI.createWidget(hmUI.widget.TEXT, {
                ...ALARM_TEXT,
                text: title
            });

            const vibrator = new Vibrator()
            vibrator.setMode(VIBRATOR_SCENE_STRONG_REMINDER)
            hmUI.createWidget(hmUI.widget.BUTTON, {
                ...BUTTON,
                text: "Ok",
                click_func: (button_widget) => {
                    vibrator.stop()
                    hmUI.createWidget(hmUI.widget.BUTTON, {
                        ...BUTTON,
                        text: "Back",
                        click_func: (_) => {
                            back()
                        }
                    })
                    hmUI.deleteWidget(button_widget)
                }
            })

            vibrator.start()
        },
    })
);
