import driver from "sqlite3";
import sql from "./sql";
let sqlite;
let path;
let db;

const database = {
  init: (home) => {
    path = home + '/zero.db'
    console.log('[database] File path: ' + path)
    if (sqlite == undefined) sqlite = driver.verbose();
    if (db == undefined) db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.queryTabel, (err, res) => {
        if (err) throw err
        db.parallelize(() => {
          for (let key in sql.initTabel) {
            let state = false;
            for (let i in res) {
              if (res[i].name === key) {
                state = true;
                break;
              }
            }
            if (state) continue;
            console.log('[database] Init ' + key + ' table')
            // 初始化表
            db.run(sql.initTabel[key], () => {
              // 初始化自增主键
              db.run(sql.initAutoId[key])
              // 初始化索引
              db.run(sql.initIndex[key])
            })
          }
        })
        db.close();
      })
    });
  },
  saveCache(obj, num, key, res, callback) {
    obj[key] = res;
    if (Object.keys(obj).length == num) callback(true, obj);
  },
  getInitData(callback) {
    let cache = {};
    db = new sqlite.Database(path);
    db.serialize(() => {
      // 获取最近三条事项
      db.all(sql.matters.getList(null, null, null, null, 3, 1, 'DESC'), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  addMatter(content, state, tag, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.add(content, state, tag), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  getMattersNumber(start, end, state, tag, del, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.get(sql.matters.getNumber(start, end, state, tag, del), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  getMattersList(start, end, state, tag, number, page, sort, del, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.getList(start, end, state, tag, number, page, sort, del), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  editMatter(id, content, state, tag, t1, t2, t3, t4, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.edit(id, content, state, tag, t1, t2, t3, t4, new Date().getTime()), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  removeMatter(callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.remove(), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  updateMatterState(id, step, state, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.updateState(id, step, state, new Date().getTime()), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  updateMatterDel(id, del, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.updateDel(id, del, new Date().getTime()), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  searchTags(key, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.tags.search(key), (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  addTag(name, callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.tags.add(name), (err, res) => {
        if (err) callback(false, res)
        db.get(sql.tags.getIdByName(name), (error, sub) => {
          callback(error ? false : true, sub)
        })
        db.close();
      })
    });
  },
  getTagList(callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.tags.getList, (err, res) => {
        callback(err ? false : true, res)
      })
    });
    db.close();
  },
  getStatistics(callback){
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.matters.statistics(false), (e1, state) => {
        if (e1) {
          db.close();
          throw e1
        }
        db.get(sql.matters.statistics(true), (e2, dels) => {
          if (e2) {
            db.close();
            throw e2
          }
          db.get(sql.tags.getNumber, (e3, tags) => {
            if (e3) {
              db.close();
              throw e3
            }
            callback(e3 ? false : true, {
              del: dels.number,
              tags: tags.number,
              state: state
            })
            db.close();
          })
        })
      })
    });
  },
  exportData(callback) {
    db = new sqlite.Database(path);
    db.serialize(() => {
      db.all(sql.tags.getList, (err, res) => {
        if (err) {
          db.close();
          throw err
        }
        db.all(sql.matters.getAll, (error, sub) => {
          if (err) {
            db.close();
            throw err
          }
          callback(error ? false : true, {
            tags: res,
            matters: sub
          })
          db.close();
        })
      })
    });
  },
  importData(addMatters, removeMatters, addTags, updateTags, callback) {
    db = new sqlite.Database(path);
    db.parallelize(() => {
      for (let i in addMatters) {
        db.run(sql.matters.importAdd(addMatters[i]))
      }
      for (let i in removeMatters) {
        db.run(sql.matters.importRemove(removeMatters[i]))
      }
      for (let i in addTags) {
        db.run(sql.tags.importAdd(addTags[i]))
      }
      for (let oid in updateTags) {
        db.run(sql.tags.importUpdate(oid, updateTags[oid]))
      }
      callback(true, {})
    })
    db.close();
  }
}

export default database