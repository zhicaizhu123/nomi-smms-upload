const { resolve } = require('path')

/**
 * 判断是否为有效链接
 *
 * @param {*} url 线上地址
 * @return {*} 
 */
function isLink(url) {
  return /((https|http|ftp|rtsp|mms)?:\/\/)(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/.test(url)
}

/**
 * 获取绝对路径
 *
 * @param {*} filePath
 * @return {*} 
 */
function getAbsolutePath(filePath) {
  return resolve(process.cwd(), filePath)
}

exports.isLink = isLink
exports.getAbsolutePath = getAbsolutePath

