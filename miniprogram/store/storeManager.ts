import { IMiniApp } from 'app'

export interface IGlobalData {
    logs: string[]
    MAP_KEY: string
}

export function initGlobalData() {
    return {
        logs: [],
        MAP_KEY: '315f3399000ff0fbefdd36e354be1177',
    }
}

export default class StoreManager {
    // StoreManager instance
    private static _storeManager: StoreManager

    private _app: IMiniApp

    constructor(app?: IMiniApp) {
        this._app = app || getApp()
        if (!this._app) {
            throw 'StoreManager Error: 获取app实例失败'
        }
    }

    public static getInstance(app?: IMiniApp): StoreManager {
        if (!this._storeManager) {
            this._storeManager = new StoreManager(app)
        }

        return this._storeManager
    }

    public initLogs() {
        // 展示本地存储能力
        const logs: string[] = wx.getStorageSync('logs') || []
        logs.unshift(Date.now().toString())
        wx.setStorageSync('logs', logs)
        this.setLogs(logs)
    }

    public setLogs(logs: string[]) {
        this._app.globalData.logs = logs
    }

    public getLogs() {
        return this._app.globalData.logs
    }
}
