const { resolve, basename } = require('path')
const { createReadStream } = require('fs');
const { pathExistsSync, statSync, writeFileSync } = require('fs-extra')
const colors = require('colors')
const fg = require('fast-glob');
const ora = require('ora')
const spinner = ora('loading')
const { getAbsolutePath } = require('./utils')
const { promptToken, promptFileInfo } = require('./prompt');
const { uploadImage } = require('./api');

// 默认配置文件名称
const DEFAULT_CONFIG_FILE = 'nomi.smms.config.js'
// 默认上传成功后本地生成的文件名称
const DEFAULT_UPLOADED_FILE = 'nomi.smms.uploaded.json'


/**
 * 调试打印日志
 *
 * @param {*} args 参数列表
 */
function verbose(...args) {
  process.env.NOMI_SMMS_UPLOAD_DEBUG && console.log(colors.blue('debug：'), ...args)
}

/**
 * 根据文件路径/目录路径获取所有需要上传的图片
 * @param {*} file 文件路径/目录路径，相对路径
 * @returns 
 */
function getFiles(file) {
  const filePath = getAbsolutePath(file)
  if (pathExistsSync(filePath)) {
    const stat = statSync(filePath)
    let files = []
    if (stat.isDirectory()) {
      const entries = fg.sync(['**'], { onlyFiles: true, cwd: filePath, ignore: ['**/node_modules/**'] });
      files = entries.map(file => resolve(filePath, file))
    } else {
      files = [filePath]
    }
    return files
  } else {
    console.log(colors.red('输入的文件或目录路径不正确'))
    process.exit(1)
  }
}


/**
 * 获取要上传的文件信息
 * @param {*} options 命令参数
 * @returns 
 */
function getFileInfoList(options) {
  const files = getFiles(options.file || '.')
  const savedFileList = files.map(file => {
    const name = basename(file)
    return {
      name,
      file,
    }
  })
  const invalidFileList = []
  savedFileList.forEach(file => {
    const suffix = file.name.split('.').pop()
    if (!/jpe?g|png|gif|bmp/g.test(suffix)) {
      invalidFileList.push(file.file)
    }
  })
  if (invalidFileList.length) {
    throw new Error(`非法格式文件列表：\n${invalidFileList.join('\n')}`)
  }
  return savedFileList
}

/**
 * 解析待上传文件信息
 * @param {*} options 命令参数
 * @returns 
 */
async function getUploadFileList(options) {
  // 根据文件/目录上传
  const fileList = getFileInfoList(options)
  return fileList
}


/**
 * 更具配置文件设置options
 *
 * @param {*} options  命令行参数
 * @return {*} 
 */
function setOptionsByConfigFile(options) {
  const customConfigFile = getAbsolutePath(options.config || DEFAULT_CONFIG_FILE)
  if (pathExistsSync(customConfigFile)) {
    const defineConfig = require(getAbsolutePath(customConfigFile))
    let data
    if (typeof defineConfig === 'function') {
      data = defineConfig()
    } else {
      data = defineConfig
    }
    const { token } = data || {}
    if (token) {
      options.token = token
    }
  }
  return options
}

/**
 * 初始化
 * 
 * @param {*} options 参数配置
 */
async function init(options) {
  const config = { ...setOptionsByConfigFile(options) }
  if (!!options.debug) {
    process.env.NOMI_SMMS_UPLOAD_DEBUG = true
  }
  // 如果没有token则需要提示手动输入
  const tokenAnswers = await promptToken(options.token)
  // 如果没有指定上传文件路径，则提示手动输入
  const fileInfoAnswers = await promptFileInfo(options.file)
  Object.assign(config, tokenAnswers, fileInfoAnswers);
  verbose('CLI config', config)
  upload(config);
}

async function uploadImageAction(file, token) {
  const smfile = createReadStream(file.file)
  const data = await uploadImage({ smfile, token })
  return data
}

async function smmsUpload(uploadFileList, token) {
  const promises = uploadFileList.map(item => {
    return uploadImageAction(item, token)
  })
  const list = await Promise.all(promises)
  return list.map((item) => ({
    name: item.filename,
    url: item.url,
    hash: item.hash,
    delete: item.delete,
  }))
} 

/**
 * 上传
 * 
 * @param {*} options 命令行参数
 */
async function upload(options) {
  try {
    // 获取要上传的文件数据
    const uploadFileList = await getUploadFileList(options)
    spinner.start('uploading files....')
    const res = await smmsUpload(uploadFileList, options.token)
    spinner.succeed('uploaded success, more upload info please see ' + colors.blue(process.cwd() + '/' + DEFAULT_UPLOADED_FILE))
    
    writeFileSync('./' + DEFAULT_UPLOADED_FILE, JSON.stringify(res, null, 4))
  } catch(err) {
    console.log();
    console.log(colors.red(err.message));
    spinner.stop();
  }
}

module.exports = init