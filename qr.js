const { Decoder } = require('@nuintun/qrcode')
const Jimp = require('jimp')
var terminal = require('qrcode-terminal')
const qrcode = new Decoder()
module.exports = async function (imagePath) {
    var imgSrc = await Jimp.read(imagePath)
    var result = qrcode.decode(
        new Int32Array(imgSrc.bitmap.data),
        imgSrc.getWidth(),
        imgSrc.getHeight(),
    )

    terminal.generate(result.data, { small: true }, function (qrcode) {
        console.log(qrcode)
    })
}
