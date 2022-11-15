import { app, dialog } from 'electron'
import ExcelJS from 'exceljs'

const work = {
    async build(t1, safe, matters, tags) {
        let t2 = new Date().getTime();
        dialog.showSaveDialog({
            title: '数据导出',
            message: '请选择存放数据文件的位置',
            buttonLabel: '开始导出',
            defaultPath: app.getPath('downloads'),
            filters: [
                { name: '数据表', extensions: ['xlsx'] }
            ]
        }).then(async result => {
            if (result.canceled) return false;
            let t3 = new Date().getTime();
            // 创建工作簿
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'TodoHelper';
            workbook.lastModifiedBy = 'SkayZhang';
            workbook.created = new Date();
            workbook.modified = new Date();
            workbook.lastPrinted = new Date();
            // 添加事项表
            const mattersSheet = workbook.addWorksheet('Matters');
            // 创建事项表头
            mattersSheet.columns = [
                { header: 'id', key: 'id' },
                { header: 'content', key: 'content' },
                { header: 'state', key: 'state' },
                { header: 'tag', key: 'tag' },
                { header: 'del', key: 'del' },
                { header: 't1', key: 't1' },
                { header: 't2', key: 't2' },
                { header: 't3', key: 't3' },
                { header: 't4', key: 't4' },
                { header: 't5', key: 't5' }
            ];
            // 插入事项数据
            for (let i in matters) {
                let item = matters[i];
                item.content = decrypt(safe, item.content);
                if (item.del === null || item.del === 'null') item.del = 0
                if (item.t1 === null || item.t1 === 'null') item.t1 = ''
                if (item.t2 === null || item.t2 === 'null') item.t2 = ''
                if (item.t3 === null || item.t3 === 'null') item.t3 = ''
                if (item.t4 === null || item.t4 === 'null') item.t4 = ''
                if (item.t5 === null || item.t5 === 'null') item.t5 = ''
                mattersSheet.addRow(item);
            }
            // 锁定事项表
            await mattersSheet.protect('Stacks.Cubic');
            // 添加标签表
            const tagsSheet = workbook.addWorksheet('Tags');
            // 创建标签表头
            tagsSheet.columns = [
                { header: 'id', key: 'id' },
                { header: 'name', key: 'name' }
            ];
            // 插入标签数据
            for (let i in tags) {
                let item = tags[i];
                tagsSheet.addRow(item);
            }
            // 锁定标签表
            await tagsSheet.protect('Stacks.Cubic');
            // 导出工作簿
            await workbook.xlsx.writeFile(result.filePath);
            dialog.showMessageBox({
                message: '导出完成',
                detail: '耗时: ' + (new Date().getTime() - t3 + t2 - t1) + 'ms'
            })
        }).catch(err => {
            dialog.showMessageBox({
                message: '导出位置选取出错',
                detail: err
            })
        })
    },
    async read(t1, safe, matters, tags) {
        let t2 = new Date().getTime();
        dialog.showOpenDialog({
            title: '数据导入',
            message: '请选择要导入的数据文件位置',
            buttonLabel: '开始导入',
            defaultPath: app.getPath('downloads'),
            properties: ['openFile'],
            filters: [
                { name: '数据表', extensions: ['xlsx'] }
            ]
        }).then(async result => {
            if (result.canceled) return false;
            let t3 = new Date().getTime();
            // 打开工作簿
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(result.filePaths[0]);
            // 读取事项表
            const mattersSheet = workbook.getWorksheet('Matters');
            mattersSheet.eachRow((row, rowNumber) => {
              console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
            });
            // 读取标签表
            const tagsSheet = workbook.getWorksheet('Tags');
            tagsSheet.eachRow((row, rowNumber) => {
              console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
            });
            dialog.showMessageBox({
                message: '导入完成',
                detail: '耗时: ' + (new Date().getTime() - t3 + t2 - t1) + 'ms'
            })
        }).catch(err => {
            dialog.showMessageBox({
                message: '导入文件选取出错',
                detail: err
            })
        })
    }
}

// 字符串解密
function decrypt(safe, text) {
    try {
        if (safe === undefined || safe === false) return text
        return safe.decryptString(Buffer.from(text, 'base64'))
    } catch (err) {
        console.log('[http] Encrypt error: ' + err)
        return text
    }
}

export default work