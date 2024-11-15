import { BasePage } from "@zeppos/zml/base-page";
import { cancel, getAllAlarms, REPEAT_ONCE, set } from '@zos/alarm';
import { getPackageInfo } from "@zos/app";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
    FETCH_TODAY_BUTTON,
    TOP_TEXT,
} from "zosLoader:./index.[pf].layout.js";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../utils/config/device";

const getDateString = (due) => {
    // ToLocaleString doesn't seem to support locales besides "en-US",
    // and the options argument is ignored.
    if (!due || due === null) {
        return ""
    }
    return new Date(due).toString().split("GMT")[0]
}

let textWidget;

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
            taskListRaw.sort((a, b) => {
                // TODO figure out why we're getting weird values from Todoist
                if (!a.due && !b.due) {
                    return 0
                }
                if (!a.due) {
                    return -1
                }
                if (!b.due) {
                    return 1
                }
                return a.due - b.due
            })
            const now = Date.now()
            let beforeNowIndex = -1
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
                        start: beforeNowIndex > -1 ? 0 : -1,
                        end: beforeNowIndex > -1 ? beforeNowIndex : -1,
                        type_id: 2
                    },
                    {
                        start: beforeNowIndex > -1 ? beforeNowIndex + 1 : 0,
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

            let taskByTaskID = {}

            hmUI.createWidget(hmUI.widget.BUTTON, {
                ...FETCH_TODAY_BUTTON,

                click_func: (button_widget) => {
                    textWidget.setProperty(hmUI.prop.TEXT, "loading...");

                    const apiKey = getApp().globalData.APIKEY
                    this.httpRequest({
                        headers: {
                            "Authorization": "Bearer " + apiKey,
                        },
                        method: 'GET',
                        url: "https://api.todoist.com/rest/v2/tasks?filter=today"
                    }).then(data => {
                        // Delete all existing alarms
                        const alarms = getAllAlarms()
                        alarms.forEach(alarm => {
                            cancel(alarm)
                        });

                        const tasks = data.body
                        const { appId } = getPackageInfo();
                        tasks.forEach(task => {
                            if (task.due.datetime != "") {
                                const t = Date.parse(task.due.datetime)
                                if (t > Date.now()) {
                                    const id = set({
                                        appid: appId,
                                        url: 'page/alarm',
                                        store: true,
                                        time: t / 1000,
                                        param: task.id,
                                        repeat_type: REPEAT_ONCE,
                                    })
                                }
                                taskByTaskID[task.id] = { title: task.content, due: t }
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
