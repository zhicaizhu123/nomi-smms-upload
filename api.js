const { post, get } = require('./request')

// 获取token
exports.getToken = (params) => post('/token', params)

// 获取账号信息
exports.getProfile = (params) => post('/profile', params)

// 上传图片
exports.uploadImage = (params) => post('/upload', params)

// 删除图片
exports.deleteImage = (params) => get(`/delete/${params.hash}`)

// 获取上传的历史图片
exports.getHistoryImages = (params) => get('/upload_history', params)