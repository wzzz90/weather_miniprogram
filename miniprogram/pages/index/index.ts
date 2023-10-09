// index.ts
// 获取应用实例
import { I18nPage } from '@miniprogram-i18n/core'
import { message, setLanguage } from '@utils/i18n'
import dayjs = require('dayjs')
import HttpManager from 'http/httpManager'
const app = getApp<IAppOption>()

const CITY_CODES: { [key: string]: string } = {
    北京: '110000',
    上海: '310000',
    广州: '440100',
    深圳: '440300',
    苏州: '320500',
    沈阳: '210100',
}

const cityList = Object.keys(CITY_CODES)

// 因为改page下的wxml使用了t函数，所以这里需要引入 I18nPage 代替 Page 构造器。
// 当然也可以采用 Component 构造器进行定义，然后在 Component 中使用 I18n 这个 Behavior
I18nPage({
    data: {
        cityList,
        //所有城市天气数据
        allWeatherCache: {},
        selectWeather: {
            currentDate: '',
            currentCityCode: CITY_CODES[cityList[0]],
            currentCity: {},
            data: {},
            isDay: true,
            reportTime: '',
        },
        showDialog: false,
        showCityDialog: false,
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: false,
        canIUseOpenData:
            wx.canIUse('open-data.type.userAvatarUrl') &&
            wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    },
    // 事件处理函数
    bindViewTap() {
        wx.navigateTo({
            url: '/pages/logs/logs',
        })
    },
    onLoad() {
        console.log('1', 1)
        // @ts-ignore
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true,
            })
        }
        this.getWeather()
    },

    getUserProfile() {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: message('displayUserInfo'), // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log(res)
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true,
                })
            },
        })
    },
    //生成城市当前日期的数据
    _generateCurrentWeather(currentDate: string, currentCity: string) {
        console.log(
            '🚀 ~ file: index.ts:75 ~ _generateCurrentWeather ~ this.data.selectWeather:',
            this.data.allWeatherCache
        )

        const currentCityData = this.data.allWeatherCache[currentCity]

        const currentDateWeather = currentCityData.casts.find(
            (item) => item.date === currentDate
        )
        console.log('currentDateWeather', currentDateWeather)

        const currHour = new Date().getHours()
        currentDateWeather &&
            this.setData({
                selectWeather: {
                    ...this.data.selectWeather,
                    data: currentDateWeather,
                    isDay: currHour >= 6 && currHour < 18,
                    currentDate,
                    currentCity: {
                        ...currentCityData,
                        displayCast: currentCityData.casts.filter(
                            (item) => item.date !== currentDate
                        ),
                    },
                },
            })

        console.log('this.data.selectWeather', this.data.selectWeather)

        // selectCity.weatherData &&
        //     (selectCity.weatherData = {
        //         ...selectCity.weatherData,
        //         casts: selectCity.weatherData.casts.filter((item) => item.date !== currentDate)
        //     });
    },
    getWeather() {
        console.log('this.selectWeather', this.data)
        HttpManager.getInstance()
            .get<IResponseType<IWeatherResData>>('/v3/weather/weatherInfo', {
                key: app.globalData.MAP_KEY,
                city: this.data.selectWeather.currentCityCode,
                extensions: 'all',
            })
            .then((res) => {
                const data = res.forecasts[0]
                if (
                    data.reporttime !== this.data.allWeatherCache.reporttime ||
                    !this.data.allWeatherCache[data.city]
                ) {
                    this.setData({
                        allWeatherCache: {
                            ...this.data.allWeatherCache,
                            [data.city]: data,
                            reporttime: data.reporttime,
                        },
                    })
                }
                const currentDate = dayjs().format('YYYY-MM-DD')

                this._generateCurrentWeather(currentDate, data.city)
            })
    },
    changeDate(event) {
        const currentDate = event.currentTarget.dataset.date
        this._generateCurrentWeather(
            currentDate,
            this.data.selectWeather.currentCity.city
        )
    },
    changeLanguage() {
        this.setData({ showDialog: true })
    },
    changeCity() {
        this.setData({ showCityDialog: true })
    },

    tapDialogButton(e: WechatMiniprogram.CustomEvent<{ index: number }>) {
        setLanguage(e.detail.index === 0 ? 'en-US' : 'zh-CN')
        this.setData({ showDialog: false })
    },
    tapCity(e) {
        const cityName = e.currentTarget.dataset.city
        console.log('🚀 ~ file: index.ts:161 ~ tapCity ~ cityName:', cityName)
        const cityCode = CITY_CODES[cityName]
        this.setData({
            selectWeather: {
                ...this.data.selectWeather,
                currentCityCode: cityCode,
            },
        })

        this.getWeather()

        this.setData({ showCityDialog: false })
    },
})
