# 待办助手

[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
![Version](https://img.shields.io/badge/dev-1.0.0-red.svg)
[![Node](https://img.shields.io/badge/node-%E2%89%A516.0.0-blue.svg)](https://nodejs.org/)
[![CodeQL](https://github.com/skay-zhang/todo-helper/workflows/CodeQL/badge.svg)](https://github.com/skay-zhang/todo-helper/security/code-scanning)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=skay-zhang_todo-helper&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=skay-zhang_todo-helper)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=skay-zhang_todo-helper&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=skay-zhang_todo-helper)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=skay-zhang_todo-helper&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=skay-zhang_todo-helper)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=skay-zhang_todo-helper&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=skay-zhang_todo-helper)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=skay-zhang_todo-helper&metric=bugs)](https://sonarcloud.io/summary/new_code?id=skay-zhang_todo-helper)

* [🚀 快速开始](#-快速开始)
* [🗂 文件结构](#-文件结构)
* [🛠 开发路线](#-开发路线)
* [😊 鸣谢](#-鸣谢)
* [❌ 构建问题](#-构建问题)
* [🎟 许可证](#-许可证)

## 🚀 快速开始

```shell
# 拉取代码
git clone https://github.com/skay-zhang/todo-helper.git ./todo-helper
# 进入项目目录
cd todo-helper
# 安装依赖
yarn install
# 运行开发环境
yarn run dev
```

## 🗂 文件结构

* /basic ··············> Node 层脚本目录
* /public ············> Vite 静态资源目录
* /src ·············> Vite 工程目录
* index.html ······> 项目基础页面
* electron-builder.json ·> 打包配置文件
* package.json ·> 项目配置文件
* vite.config.js ··> Vite 配置文件

## 🛠 开发路线

* [X] 事项快速创建窗口
* [X] 事项管理窗口
* [x] Http 通讯服务
* [x] SQLite 数据库服务
* [X] 数据统计
* [x] 数据加密
* [x] 事项批量操作
* [x] 导出 Excel
* [x] 导入 Excel
* [x] 新版本检测
* [ ] 日报生成
* [ ] 周报生成
* [ ] 月报生成
* [ ] 事项看板


## 😊 鸣谢
Thanks to the following projects that make TodoHelper possible.

> Alphabetical order

* [AntDesign Vue](https://github.com/vueComponent/ant-design-vue)
* [Electron](https://github.com/electron/electron)
* [Electron Vite Vue](https://github.com/electron-vite/electron-vite-vue)
* [Exceljs](https://github.com/exceljs/exceljs)
* [Express](https://github.com/expressjs/express)
* [NodeJS](https://github.com/nodejs/node)
* [Sonar Cloud](https://sonarcloud.io/)
* [SQLite3](https://github.com/TryGhost/node-sqlite3)
* [Vue](https://github.com/vuejs/vue)
* [Vite](https://github.com/vitejs/vite)

## ❌ 构建问题

you need to add `if(!statuses.message) return;` to **http-errors** after line **260** of **index.js** before.

[issues#92](https://github.com/jshttp/http-errors/issues/92)

[No further execution when message are empty](https://github.com/skay-zhang/http-errors/commit/9130e5a960571863a9204cf4fb34cc3014499e52)

## 🎟 许可证

[MIT](LICENSE)