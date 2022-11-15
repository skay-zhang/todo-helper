const sql = {
  queryTabel: `SELECT name FROM sqlite_master WHERE type = 'table';`,
  initTabel: {
    tags: `CREATE TABLE "main"."tags" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL);`,
    matters: `CREATE TABLE "main"."matters" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "content" TEXT NOT NULL, "state" INTEGER(1), "tag" TEXT, "del" INTEGER, "t1" TEXT(15) NOT NULL, "t2" TEXT(15), "t3" TEXT(15), "t4" TEXT(15), "t5" TEXT(15));`
  },
  initAutoId: {
    tags: `INSERT INTO "main"."sqlite_sequence" (name, seq) VALUES ('tags', '10000');`,
    matters: `INSERT INTO "main"."sqlite_sequence" (name, seq) VALUES ('matters', '10000');`,
  },
  initIndex: {
    tags: `CREATE UNIQUE INDEX "main"."tid" ON "tags" ("id" COLLATE BINARY ASC);`,
    matters: `CREATE UNIQUE INDEX "main"."mid" ON "matters" ("id" COLLATE BINARY ASC);`,
  },
  tags: {
    add: (name) => {
      return `INSERT INTO "main"."tags" ("name") VALUES ('${name}');`;
    },
    edit: (id, name) => {
      return `UPDATE "main"."tags" SET "name" = ${name} WHERE "id" = ${id};`
    },
    remove: id => {
      return `DELETE FROM "main"."tags" WHERE "id" = ${id};`
    },
    search: key => {
      return `SELECT "id","name" FROM "tags" WHERE "name" LIKE '%${key}%' LIMIT 0,5;`;
    },
    getIdByName: key => {
      return `SELECT "id" FROM "tags" WHERE "name" = '${key}' LIMIT 0,1;`;
    },
    getNumber: `SELECT COUNT(1) AS 'number' FROM "tags";`,
    getList: `SELECT "id","name" FROM "tags";`,
    importAdd: tag => {
      return `INSERT INTO "main"."tags" ("id","name") VALUES ('${tag.id}','${tag.name}');`;
    },
    importUpdate: (oid, tag) => {
      return `UPDATE "main"."tags" SET "id" = '${tag.id}', "name" = '${tag.name}' WHERE "id" = ${oid};`
    }
  },
  matters: {
    add: (content, state, tag) => {
      return `INSERT INTO "main"."matters" ("t1","content","state","tag") VALUES ('${new Date().getTime()}','${content}','${state}','${tag}');`;
    },
    edit: (id, content, state, tag, t1, t2, t3, t4, t5) => {
      return `UPDATE "main"."matters" SET "content" = '${content}',"state" = '${state}',"tag" = '${tag}',"t1" = '${t1}',"t2" = '${t2}',"t3" = '${t3}',"t4" = '${t4}',"t5" = '${t5}' WHERE "id" = ${id};`
    },
    updateState: (id, step, state, date) => {
      return `UPDATE "main"."matters" SET "state" = '${state}', "${step}" = '${date}', "t5" = '${date}' WHERE "id" = ${id};`
    },
    updateDel: (id, del, date) => {
      return `UPDATE "main"."matters" SET "del" = '${del}', "t5" = '${date}' WHERE "id" = ${id};`
    },
    remove: () => {
      return `DELETE FROM "main"."matters" WHERE del = '1';`
    },
    getNumber: (start, end, state, tag, del) => {
      let screen = sql.matters.buildScreen(start, end, state, tag, del);
      return `SELECT COUNT(1) AS 'number' FROM "matters" WHERE ${screen};`
    },
    getList: (start, end, state, tag, number, page, sort, del) => {
      let screen = sql.matters.buildScreen(start, end, state, tag, del);
      if (sort !== 'DESC' && sort !== 'ASC') sort = 'ASC'

      return `SELECT "id","content","state","tag","del","t1","t2","t3","t4","t5" FROM "matters" WHERE ${screen} ORDER BY "t1" ${sort} LIMIT ${page == 0 ? 0 : (page - 1) * number},${number};`
    },
    buildScreen: (start, end, state, tag, del) => {
      let screen = '';
      if (start) screen = `"t1" >= '${start}' AND `
      if (end) screen += `"t1" <= '${end}' AND `
      if (state > 0) screen += `"state" = ${state} AND `
      if (tag) screen += `"tag" LIKE '%${tag}%' AND `
      if (del === 1 || del === '1') screen += '"del" = 1'
      else screen += '("del" IS NULL OR "del" = 0)'
      return screen;
    },
    getAll: `SELECT "id","content","state","tag","del","t1","t2","t3","t4","t5" FROM "matters";`,
    statistics: (del)=>{
      if(del) return `SELECT COUNT(1) AS 'number' FROM matters WHERE matters.del = 1`
      else return `SELECT matters.state, COUNT(1) AS 'number' FROM matters WHERE matters.del = 0 GROUP BY matters.state`
    },
    importAdd: matter => {
      return `INSERT INTO "main"."matters" ("id","content","state","tag","del","t1","t2","t3","t4","t5") VALUES ('${matter.id}','${matter.content}','${matter.state}','${matter.tag}','${matter.del}','${matter.t1}','${matter.t2}','${matter.t3}','${matter.t4}','${matter.t5}');`;
    },
    importRemove: (id) => {
      return `DELETE FROM "main"."matters" WHERE "id" = '${id}';`
    }
  }
}

export default sql