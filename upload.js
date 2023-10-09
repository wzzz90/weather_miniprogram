// 小程序发版
const ci = require('miniprogram-ci')
const path = require('path')
const argv = require('yargs').argv
const readline = require('readline')
console.qr = require('./qr.js')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
// 同步执行流程控制
function rlPromisify(fn) {
    return async (...args) => {
        return new Promise((resolve) => fn(...args, resolve))
    }
}

const question = rlPromisify(rl.question.bind(rl))
const appid = 'wx2535ee5d5792de0f'
let versions = '1.0.1'
let descs = '1.0.1'
let projectPath = './dist'

return (async () => {
    if (argv.type == 'upload') {
        versions = await question('请输入新版本号：')
        console.log(`新版本号：${versions}`)
        descs = await question('请输入项目备注：')
        console.log(`备注：${descs}`)
        rl.close()
    } // 注意： new ci.Project 调用时，请确保项目代码已经是完整的，避免编译过程出现找不到文件的报错。

    const project = new ci.Project({
        appid: appid,
        type: 'miniProgram',
        projectPath: path.join(__dirname, projectPath), // 项目路径
        privateKeyPath: path.join(
            __dirname,
            './private.wx2535ee5d5792de0f.key',
        ), // 密钥的路径
        ignores: ['node_modules/**/*'],
    })

    if (argv.type == 'preview') {
        const previewResult = await ci.preview({
            project,
            desc: 'hello', // 此备注将显示在“小程序助手”开发版列表中
            setting: {
                es6: true,
            },
            qrcodeFormat: 'image',
            qrcodeOutputDest: path.join(__dirname, '/qrcode/destination.jpg'),
            onProgressUpdate: console.log,
            pagePath: 'pages/index/index', // 预览页面
            searchQuery: 'a=1&b=2', // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
        })
        console.log('previewResult', previewResult)
        console.qr(path.join(__dirname, '/qrcode/destination.jpg'))
    } else {
        // 测试 打包完 需要等待一会才能读到文件，所以加个定时器
        console.log('等待5秒后 开始上传')
        let s = 5
        let timer = setInterval(async () => {
            --s
            console.log(`${s}秒`)
            if (s == 0) {
                clearInterval(timer)
                timer = undefined
                const uploadResult = await ci.upload({
                    project,
                    version: versions,
                    desc: descs,
                    setting: {
                        es6: false, // es6 转 es5
                        disableUseStrict: true,
                        autoPrefixWXSS: true, // 上传时样式自动补全
                        minifyJS: true,
                        minifyWXML: true,
                        minifyWXSS: true,
                    },
                })
                console.log('uploadResult', uploadResult)
            }
        }, 1000)
    }
})()
