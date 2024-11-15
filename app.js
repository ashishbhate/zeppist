import { BaseApp } from "@zeppos/zml/base-app";
import { log as Logger } from "@zos/utils";
import LocalStorage from "./utils/storage";

const logger = Logger.getLogger("zeppist");

const fileName = "zeppist_data.txt";

// The app icon was taken from flaticon
// Attrib:
// To do icon created by GOFOX - Flaticon
// "https://www.flaticon.com/free-icons/to-do

App(
    BaseApp({
        globalData: {
            "APIKEY": "XXX ADD YOUR TODOIST API KEY HERE XXX",
            "TRIGGERED_TASK_ID": 0,
            "TASK_BY_TASK_ID": {},
            "LAST_SYNC": 0,
            localStorage: null,
        },
        onCreate(options) {
            getApp().globalData.TRIGGERED_TASK_ID = options
            try {
                this.globalData.localStorage = new LocalStorage(fileName);
                const { TASK_BY_TASK_ID, LAST_SYNC } = this.globalData.localStorage.get();
                this.globalData.TASK_BY_TASK_ID = TASK_BY_TASK_ID;
                this.globalData.LAST_SYNC = LAST_SYNC;
            } catch (e) {
                logger.log("error loading task data: ", e);
            }
        },

        onDestroy() {
            console.log("app on destroy invoke");
            this.globalData.localStorage.set({
                TASK_BY_TASK_ID: getApp().globalData.TASK_BY_TASK_ID,
                LAST_SYNC: getApp().globalData.LAST_SYNC,
            });
        },
    })
);
