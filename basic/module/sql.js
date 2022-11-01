const sql = {
  queryTabel: `SELECT name FROM sqlite_master WHERE type = 'table';`,
  initTabel: {
    tags: `CREATE TABLE "main"."tags" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "default" INTEGER(1));`,
    group: `CREATE TABLE "main"."group" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "rule" TEXT(255));`,
    matters: `CREATE TABLE "main"."matters" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "date" TEXT(15) NOT NULL, "content" TEXT NOT NULL, "state" INTEGER(1), "tag" TEXT, "del" INTEGER(1));`
  },
  initIndex: {
    tags: `CREATE UNIQUE INDEX "main"."tid" ON "tags" ("id" COLLATE BINARY ASC);`,
    group: `CREATE UNIQUE INDEX "main"."gid" ON "group" ("id" COLLATE BINARY ASC);`,
    matters: `CREATE UNIQUE INDEX "main"."mid" ON "matters" ("id" COLLATE BINARY ASC);`,
  },
  tags: {
    add: (name, isDefault) => {
      if (isDefault === undefined) return `INSERT INTO "main"."tags" ("name") VALUES ('${name}');`;
      return `INSERT INTO "main"."tags" ("name", "default") VALUES ('${name}', '${isDefault ? 1 : 0}');`;
    },
    edit: (id, name, isDefault) => {
      let def = 'NULL';
      if (isDefault !== undefined) def = isDefault ? '1' : '0';
      return `UPDATE "main"."tags" SET "name" = ${name},"default" = ${def} WHERE rowid = ${id};`
    },
    remove: id => {
      return `DELETE FROM "main"."tags" WHERE rowid = ${id};`
    },
    search: key => {
      return `SELECT "id","name","default" FROM "tags" WHERE "name" LIKE '%${key}%' LIMIT 0,5;`;
    },
    getIdByName: key => {
      return `SELECT "id" FROM "tags" WHERE "name" = '${key}' LIMIT 0,1;`;
    },
    getNumber: `SELECT COUNT(1) AS 'number' FROM "tags";`,
    getList: `SELECT "id","name","default" FROM "tags";`
  },
  group: {
    add: (name, rule) => {
      return `INSERT INTO "main"."group" ("name", "rule") VALUES ('${name}', '${rule}');`;
    },
    edit: (id, name, rule) => {
      return `UPDATE "main"."group" SET "name" = ${name},"rule" = ${rule} WHERE rowid = ${id};`
    },
    remove: id => {
      return `DELETE FROM "main"."group" WHERE rowid = ${id};`
    },
    getNumber: `SELECT COUNT(1) AS 'number' FROM "group";`,
    getList: `SELECT "group"."id","group"."name","group"."rule" FROM "group";`
  },
  matters: {
    add: (content, state, tag) => {
      return `INSERT INTO "main"."matters" ("date","content","state","tag") VALUES ('${new Date().getTime()}','${content}','${state}','${tag}');`;
    },
    edit: (id, date, content, state, tag, del) => {
      return `UPDATE "main"."matters" SET "date" = ${date},"content" = ${content},"state" = ${state},"tag" = ${tag},"del" = ${del} WHERE rowid = ${id};`
    },
    update: (id,key,value) => {
      return `UPDATE "main"."matters" SET "${key}" = ${value} WHERE rowid = ${id};`
    },
    remove: id => {
      return `DELETE FROM "main"."matters" WHERE rowid = ${id};`
    },
    getNumber: (start, end, state, tag, del) => {
      let screen = sql.matters.buildScreen(start, end, state, tag, del);
      return `SELECT COUNT(1) AS 'number' FROM "matters" WHERE ${screen};`
    },
    getList: (start, end, state, tag, number, page, sort, del) => {
      let screen = sql.matters.buildScreen(start, end, state, tag, del);
      if (sort !== 'DESC' && sort !== 'ASC') sort = 'ASC'

      return `SELECT "id","date","content","state","tag","del" FROM "matters" WHERE ${screen} ORDER BY "date" ${sort} LIMIT ${page == 0 ? 0 : (page - 1) * number},${number};`
    },
    buildScreen: (start, end, state, tag, del) => {
      let screen = '';
      if (start) screen = `"date" >= '${start}' AND `
      if (end) screen += `"date" <= '${end}' AND `
      if (state > 0) screen += `"state" = ${state} AND `
      if (tag) screen += `"tag" LIKE '%${tag}%' AND `
      if (del === 1) screen += '"del" = 1'
      else screen += '("del" IS NULL OR "del" = 0)'
      return screen;
    }
  }
}

export default sql