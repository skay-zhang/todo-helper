import driver from "sqlite3";
import sql from "./sql";
let sqlite;
let db;

const database = {
    init: () => {
        if (sqlite == undefined) sqlite = driver.verbose();
        if (db == undefined) db = new sqlite.Database('zero.db');
        db.serialize(() => {
            db.all(sql.queryTabel, (err, res) => {
                if (err) throw err
                table.createNotExist(res)
            })
        });
    },
    close() {
        db.close();
    }
}

const table = {
    createNotExist: (exist) => {
        for (let key in sql.initTabel) {
            let state = false;
            for (let i in exist) {
                if (exist[i].name === key) {
                    state = true;
                    break;
                }
            }
            if (state) continue;
            console.log('[database] Init ' + key + ' table')
            // 初始化表
            db.run(sql.initTabel[key],()=>{
                // 初始化索引
                db.run(sql.initIndex[key])
            })
        }
    }
}

export default database