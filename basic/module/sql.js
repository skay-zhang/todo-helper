export default sql = {
  queryTabel: "SELECT name FROM sqlite_master WHERE type = 'table'",
  initTabel: {
    // 标签表
    'tags': 'CREATE TABLE "main"."tags" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "default" INTEGER(1));',
    // 分组表
    'group': 'CREATE TABLE "main"."group" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "rule" TEXT(255));',
    // 事项表
    'matters': 'CREATE TABLE "main"."matters" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "date" TEXT(15) NOT NULL, "content" TEXT NOT NULL, "state" INTEGER(1), "tag" TEXT, "del" INTEGER(1));'
  },
  initIndex:{
    'tags': 'CREATE UNIQUE INDEX "main"."tid" ON "tags" ("id" COLLATE BINARY ASC);',
    'group': 'CREATE UNIQUE INDEX "main"."gid" ON "group" ("id" COLLATE BINARY ASC);',
    'matters': 'CREATE UNIQUE INDEX "main"."mid" ON "matters" ("id" COLLATE BINARY ASC);',
  }
}