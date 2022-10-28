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
    db.close();
  },
  saveCache(obj, num, key, res, callback) {
    obj[key] = res;
    if (Object.keys(obj).length == num) callback(true, obj);
  },
  getInitData(callback) {
    let cache = {};
    db = new sqlite.Database('zero.db');
    db.serialize(() => {
      db.parallelize(() => {
        // 获取标签列表
        db.get(sql.tags.getList, (err, res) => {
          database.saveCache(cache, 3, 'tags', res ? res : [], callback);
        })
        // 获取分组列表
        db.get(sql.group.getList, (err, res) => {
          database.saveCache(cache, 3, 'group', res ? res : [], callback);
        })
        // 获取最近三条事项
        db.all(sql.matters.getList(null, null, null, null, 3, 1, 'DESC'), (err, res) => {
          database.saveCache(cache, 3, 'matters', res ? res : [], callback);
        })
      });
    });
    db.close();
  },
  addMatters(content, state, tag, callback) {
    db = new sqlite.Database('zero.db');
    db.serialize(() => {
      db.all(sql.matters.add(content, state, tag), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  getMattersNumber(start, end, state, tag, del, callback) {
    db = new sqlite.Database('zero.db');
    db.serialize(() => {
      db.get(sql.matters.getNumber(start, end, state, tag, del), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  getMattersList(start, end, state, tag, number, page, sort, del, callback) {
    db = new sqlite.Database('zero.db');
    db.serialize(() => {
      db.all(sql.matters.getList(start, end, state, tag, number, page, sort, del), (err, res) => {
        callback(err ? false : true, res)
      })
    });
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
      db.run(sql.initTabel[key], () => {
        // 初始化索引
        db.run(sql.initIndex[key])
      })
    }
  }
}

export default database