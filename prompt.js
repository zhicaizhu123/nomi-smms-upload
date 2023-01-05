const { pathExistsSync, statSync } = require('fs-extra')
const inquirer = require('inquirer')
const { getAbsolutePath } = require('./utils')

async function promptToken(token) {
  const promptOptions = []
  if (!token) {
    promptOptions.push({
      type: 'input',
      name: 'token',
      message: '请输入smms token',
    })
  }
  const answers = await inquirer.prompt(promptOptions);
  return answers
}

async function promptFileInfo(file) {
  const promptOptions = []
  if (!file) {
    promptOptions.push({
      type: 'input',
      name: 'file',
      message: '请输入要上传的文件或则目录的相对路径',
      default: '.',
      validate: function (value) {
        const done = this.async();
        setTimeout(() => {
          if (!pathExistsSync(getAbsolutePath(value))) {
            done('请输入正确的路径');
            return;
          }
          done(null, true);
        }, 0);
      },
    })
  }
  const answers = await inquirer.prompt(promptOptions);
  return answers
}

exports.promptToken = promptToken
exports.promptFileInfo = promptFileInfo