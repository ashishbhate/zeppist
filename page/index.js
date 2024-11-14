import { BasePage } from "@zeppos/zml/base-page";
import { cancel, getAllAlarms, REPEAT_ONCE, set } from '@zos/alarm';
import { getPackageInfo } from "@zos/app";
import { GESTURE_LEFT, onGesture } from '@zos/interaction';
import { getSwiperIndex, SCROLL_MODE_SWIPER_HORIZONTAL, setScrollMode, swipeToIndex } from '@zos/page';
import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import {
    FETCH_RESULT_STATUS,
    FETCH_RESULT_TEXT,
    FETCH_TODAY_BUTTON,
} from "zosLoader:./index.[pf].layout.js";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../utils/config/device";

const logger = Logger.getLogger("zeppist");

const getDateString = (due) => {
    // ToLocaleString doesn't seem to support locales besides "en-US",
    // and the options argument is ignored.
    console.log("due: ", due)
    if (!due || due === null) {
        return ""
    }
    return new Date(due).toString().split("GMT")[0]
}

let textWidget;
let textWidgetStatus;

Page(
    BasePage({
        state: {
            _taskListWidget: null,
        },

        buildTaskList(taskListRaw) {
            if (!taskListRaw) {
                return
            }
            // Zepp docs say to use this.state._taskListWidget.setProperty(prop.UPDATE_DATA...
            // to update the widget's data instead of redrawing the whole widget,
            // but method call is broken, so we destroy and redraw the widget
            if (this.state._taskListWidget) {
                hmUI.deleteWidget(this.state._taskListWidget)
            }
            taskListRaw.sort((a, b) => a.due - b.due)
            const taskList = taskListRaw.map((val) => {
                return {
                    title: val.title,
                    due: new Date(val.due).toString().split("GMT")[0]
                }
            })

            this.state._taskListWidget = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
                item_space: px(10),
                item_config: [
                    {
                        type_id: 1,
                        text_view: [
                            {
                                x: px(15),
                                y: px(0),
                                w: px(360),
                                h: px(45),
                                key: 'title',
                                color: 0xffffff,
                                text_size: px(36),
                                align_h: hmUI.align.LEFT
                            },
                            {
                                x: px(15),
                                y: px(50),
                                w: px(360),
                                h: px(25),
                                key: 'due',
                                color: 0xaaaaaa,
                                text_size: px(24),
                                align_h: hmUI.align.LEFT
                            }
                        ],
                        text_view_count: 2,
                        item_height: px(75)
                    },
                ],
                item_config_count: 1,
                x: DEVICE_WIDTH + px(40),
                y: px(50),
                h: DEVICE_HEIGHT - px(100),
                w: DEVICE_WIDTH - px(40),
                data_array: taskList,
                data_count: taskList.length,
                data_type_config: [
                    {
                        start: 0,
                        end: taskList.length,
                        type_id: 1
                    }
                ],
                data_type_config_count: 1,
                on_page: 1,
                item_enable_horizontal_drag: false,
            })
        },

        build() {
            setScrollMode({
                mode: SCROLL_MODE_SWIPER_HORIZONTAL,
                options: {
                    width: DEVICE_WIDTH,
                    count: 2,
                },
            })
            if (getApp().globalData.TASK_BY_TASK_ID) {
                this.buildTaskList(Object.values(getApp().globalData.TASK_BY_TASK_ID))
            } else {
                this.buildTaskList([{ title: "No sync'd tasks", due: null }])
            }

            hmUI.createWidget(hmUI.widget.PAGE_INDICATOR, {
                x: 0,
                y: px(15),
                w: DEVICE_WIDTH,
                h: px(10),
                align_h: hmUI.align.CENTER_H,
                align_y: hmUI.align.CENTER_V,
                h_space: px(10),
                select_src: 'select_page.png',
                unselect_src: 'unselect_page.png'
            })

            // This gesture shouldn't be required, but it seems setScrollMode is
            // broken when the scroll resets back to the first page.
            //
            // Also, I think gesture detection is broken. GESTURE_UP and GESTURE_DOWN,
            // correspond to up and down gestures, but it seems GESTURE_RIGHT
            // and GESTURE_LEFT are inverted. i.e GESTURE_RIGHT is a left swipe
            // and GESTURE_LEFT is a right swipe
            onGesture({
                callback: (event) => {
                    if (event === GESTURE_LEFT) {
                        if (getSwiperIndex() == 1) {
                            swipeToIndex({ index: 1 })
                        }
                    }
                    return true
                },
            })

            textWidgetStatus = hmUI.createWidget(hmUI.widget.TEXT, {
                ...FETCH_RESULT_STATUS,
                text: "",
            });


            textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
                ...FETCH_RESULT_TEXT,
                text: getDateString(getApp().globalData.LAST_SYNC) || "Tasks not sync'd"
            });


            hmUI.createWidget(hmUI.widget.BUTTON, {
                ...FETCH_TODAY_BUTTON,

                click_func: (button_widget) => {
                    logger.log("Syncing Today");

                    textWidgetStatus.setProperty(hmUI.prop.TEXT, "loading...");

                    const apiKey = getApp().globalData.APIKEY
                    this.httpRequest({
                        headers: {
                            "Authorization": "Bearer " + apiKey,
                        },
                        method: 'GET',
                        url: "https://api.todoist.com/rest/v2/tasks?filter=today"
                    }).then(data => {
                        logger.log("receive data");
                        // Delete all existing alarms
                        logger.log("clearing alarms");
                        const alarms = getAllAlarms()
                        alarms.forEach(alarm => {
                            cancel(alarm)
                            console.log(" destroying ", alarm)
                        });

                        const tasks = data.body
                        var taskByTaskID = {}
                        const { appId } = getPackageInfo();
                        tasks.forEach(task => {
                            if (task.due.datetime != "") {
                                const t = Date.parse(task.due.datetime)
                                console.log("datetime: ", task.due.datetime)
                                console.log("stamp: ", t)
                                console.log("now: ", Date.now())
                                if (t > Date.now()) {
                                    const id = set({
                                        appid: appId,
                                        url: 'page/alarm',
                                        store: true,
                                        time: t / 1000,
                                        param: task.id,
                                        repeat_type: REPEAT_ONCE,
                                    })
                                    if (id != 0) {
                                        taskByTaskID[task.id] = { title: task.content, due: t }
                                    }
                                    console.log("setting ", id)
                                }
                            }
                        })

                        getApp().globalData.TASK_BY_TASK_ID = taskByTaskID
                        const now = Date.now()
                        getApp().globalData.LAST_SYNC = now
                        textWidgetStatus.setProperty(hmUI.prop.TEXT, "done!");
                        textWidget.setProperty(hmUI.prop.TEXT, getDateString(now));
                        this.buildTaskList(Object.values(taskByTaskID))
                    })
                },
            });
        },
    })
);
