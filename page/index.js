import { BasePage } from "@zeppos/zml/base-page";
import { cancel, getAllAlarms, REPEAT_ONCE, set } from '@zos/alarm';
import { getPackageInfo } from "@zos/app";
import { GESTURE_LEFT, onGesture } from '@zos/interaction';
import { getSwiperIndex, SCROLL_MODE_SWIPER_HORIZONTAL, setScrollMode, swipeToIndex } from '@zos/page';
import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import {
    TOP_TEXT,
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
            const now = Date.now()
            let beforeNowIndex = 0
            const taskList = taskListRaw.map((val, idx) => {
                if (val.due < now) {
                    beforeNowIndex = idx
                }
                return {
                    title: val.title,
                    due: getDateString(val.due)
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
                    {
                        type_id: 2,
                        text_view: [
                            {
                                x: px(15),
                                y: px(0),
                                w: px(360),
                                h: px(45),
                                key: 'title',
                                color: 0xffaa00,
                                text_size: px(36),
                                align_h: hmUI.align.LEFT
                            },
                            {
                                x: px(15),
                                y: px(50),
                                w: px(360),
                                h: px(25),
                                key: 'due',
                                color: 0xa56e00,
                                text_size: px(24),
                                align_h: hmUI.align.LEFT
                            }
                        ],
                        text_view_count: 2,
                        item_height: px(75)
                    }
                ],
                item_config_count: 2,
                x: px(40),
                y: px(65),
                h: DEVICE_HEIGHT - px(115),
                w: DEVICE_WIDTH - px(40),
                data_array: taskList,
                data_count: taskList.length,
                data_type_config: [
                    {
                        start: beforeNowIndex ? 0 : -1,
                        end: beforeNowIndex ? -1 : beforeNowIndex,
                        type_id: 2
                    },
                    {
                        start: beforeNowIndex ? 0 : beforeNowIndex + 1,
                        end: taskList.length,
                        type_id: 1
                    }
                ],
                data_type_config_count: 2,
                item_enable_horizontal_drag: false,
            })
        },

        build() {
            if (getApp().globalData.TASK_BY_TASK_ID) {
                this.buildTaskList(Object.values(getApp().globalData.TASK_BY_TASK_ID))
            } else {
                this.buildTaskList([{ title: "No sync'd tasks", due: null }])
            }

            textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
                ...TOP_TEXT,
                text: getDateString(getApp().globalData.LAST_SYNC) || "Tasks not sync'd"
            });


            hmUI.createWidget(hmUI.widget.BUTTON, {
                ...FETCH_TODAY_BUTTON,

                click_func: (button_widget) => {
                    logger.log("Syncing Today");

                    textWidget.setProperty(hmUI.prop.TEXT, "loading...");

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
                        textWidget.setProperty(hmUI.prop.TEXT, getDateString(now));
                        this.buildTaskList(Object.values(taskByTaskID))
                    })
                },
            });
        },
    })
);
