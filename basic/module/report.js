// 周期性报告
import { app, dialog } from 'electron'

function selectSavePath(name, callback) {
    dialog.showSaveDialog({
        title: '报告导出',
        message: '请选择存放报告文件的位置',
        buttonLabel: '开始导出',
        defaultPath: app.getPath('downloads') + '/' + name + '.docx',
        filters: [
            { name: '报告', extensions: ['docx'] }
        ]
    }).then(async result => {
        if (result.canceled) return false;
        callback(result.filePath)
    }).catch(err => {
        dialog.showMessageBox({
            message: '导出位置选取出错'
        })
        console.log(err)
    })
}

function formatTime(timestamp, fmt) {
    let date = new Date();
    if (timestamp) date = new Date(timestamp)
    let o = {
        'M+': date.getMonth() + 1,
        'w+': Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / 86400000 / 7),
        'd+': date.getDate(),
        'q+': Math.floor((date.getMonth() + 3) / 3)
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substring(4 - RegExp.$1.length))
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substring(('' + o[k]).length)))
        }
    }
    return fmt
}

const report = {
    day(db, date) {
        let start = date.setHours(0, 0, 0, 0)
        let end = date.setHours(23, 59, 59, 999)
        selectSavePath(formatTime(date, 'yyyyMMdd'), path => {
            db.getMattersList(start, end, 0, '', 999999, 1, 'ASC', 0, (_state, res) => {
                if (res == undefined) res = [];
                dialog.showMessageBox({
                    message: '日报导出完成',
                    detail: '覆盖事项数: ' + res.length
                })
            })
        })
    },
    week(db, date) {
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let weekday = new Date(year, month, day)
        let start = new Date(year, month, day + 1 - weekday.getDay()).setHours(0, 0, 0, 0)
        let end = new Date(year, month, day + 7 - weekday.getDay()).setHours(23, 59, 59, 999)
        selectSavePath(formatTime(date, 'yyyy年第ww周'), path => {
            db.getMattersList(start, end, 0, '', 999999, 1, 'ASC', 0, (_state, res) => {
                if (res == undefined) res = [];
                dialog.showMessageBox({
                    message: '周报导出完成',
                    detail: '覆盖事项数: ' + res.length
                })
            })
        })
    },
    month(db, date) {
        let year = date.getFullYear()
        let month = date.getMonth()
        let days = (new Date(year, month + 1, 1) - new Date(year, month, 1)) / (1000 * 60 * 60 * 24)
        let start = new Date(year, month, 1).setHours(0, 0, 0, 0)
        let end = new Date(year, month, days).setHours(23, 59, 59, 999)
        selectSavePath(formatTime(date, 'yyyy年MM月'), path => {
            db.getMattersList(start, end, 0, '', 999999, 1, 'ASC', 0, (_state, res) => {
                if (res == undefined) res = [];
                dialog.showMessageBox({
                    message: '月报导出完成',
                    detail: '覆盖事项数: ' + res.length
                })
            })
        })
    },
}

export default report