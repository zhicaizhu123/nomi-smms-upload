#!/usr/bin/env node
const init = require('.')
const pkg = require('./package.json')
const { Command } = require('commander');
const program = new Command();

const cliName = Object.keys(pkg.bin)[0]

program
  .name(cliName)
  .description('基于 smms 的文件上传CLI')
  .version(pkg.version)
  .option('-t, --token <string>', 'smms token')
  .option('-f, --file <string>', '本地图片路径，单张图片大小不能超过5M')
  .option('-c, --config <string>', '配置文件路径')
  .option('-d, --debug', '是否开启调试模式')

program.parse(process.argv)

init(program.opts())