import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import http from 'http'

// 服务对象
let Server;
// 会话连接池
let Sockets = [];
let database;

const httpService = {
  port: 22333,
  state: false,
  start: (dev, db, safe) => {
    console.log('[http] Service start on port ' + httpService.port)
    Server = http.createServer(controller(dev, db, safe)).listen(httpService.port, () => {
      console.log('Service Running')
      httpService.state = true
      database = db
    })
    Server.on("connection", function (socket) {
      let ip = socket.remoteAddress;
      // 仅允许本地访问
      if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        Sockets.push(socket);
        socket.once("close", function () {
          Sockets.splice(Sockets.indexOf(socket), 1);
        });
      } else socket.destroy();
    });
  },
  stop: () => {
    console.log('[http] Service ready to stop, end ' + Sockets.length + ' connections')
    // 关闭连接
    Sockets.forEach(function (socket) {
      socket.destroy();
    });
    // 停止服务
    if (Server) {
      Server.close(() => {
        console.log('[http] Service stop')
        httpService.state = false
        Sockets = []
        Server = {}
      });
    }
  }
}

// 请求控制器
// dev: 是否处于开发模式
// db: 数据库操作对象
// safe: 安全加密对象
function controller(dev, db, safe) {
  let serve = express()
  // 全局拦截
  serve.all("*", (req, res, next) => {
    // 开发时开启跨域
    if (dev) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'content-type');
      res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    }
    if (req.method.toLowerCase() == 'options') res.send(200);
    else next();
  })
  serve.use(bodyParser.urlencoded({ extends: false }))
  // 初始化添加页面
  serve.get('/api/add', (_req, res) => {
    db.getInitData((state, data) => {
      if (data && data.matters) {
        for (let i in data.matters) {
          let item = data.matters[i];
          if (item.del === null) delete item.del;
          if (item.tag === null || item.tag === '') delete item.tag;
        }
      }
      data.safe = safe === false ? false : true
      ret(res, state, data)
    })
  });
  // 添加事项
  serve.post('/api/add', (req, res) => {
    let body = req.body;
    if (body.content == undefined || body.content == '') return ret(res, false, '内容不能为空')
    if (body.state == undefined || body.state == '') return ret(res, false, '状态不能为空')
    if (body.tag == undefined) body.tag = ''
    db.addMatters(encrypt(safe, body.content), body.state, body.tag, (state, data) => {
      ret(res, state, data)
    })
  });
  // 获取事项数量
  serve.post('/api/number', (req, res) => {
    let body = req.body;
    db.getMattersNumber(body.start, body.end, body.state, body.tag, body.del, (state, data) => {
      if (data.number === undefined) data.number = 0
      ret(res, state, data.number)
    })
  });
  // 获取事项列表
  serve.post('/api/list', (req, res) => {
    let body = req.body;
    if (body.number == undefined || body.number == '') return ret(res, false, '每页数量不能为空')
    if (body.page == undefined || body.page == '') return ret(res, false, '页码不能为空')
    db.getMattersList(body.start, body.end, body.state, body.tag, body.number, body.page, body.sort, body.del, (state, data) => {
      if (data) {
        for (let i in data) {
          let item = data[i];
          if (item.del === null) delete item.del;
          if (item.tag === null || item.tag === '') delete item.tag;
          item.content = decrypt(safe, item.content);
        }
      }
      ret(res, state, data)
    })
  });
  // 编辑事项
  serve.post('/api/item', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 移除事项
  serve.delete('/api/item', (_req, res) => {
    ret(res, true, 'ok')
  });
  serve.use(express.static(path.join(__dirname, dev ? '../client' : '../../public/client')))
  return serve;
}

function ret(res, state, result) {
  res.setHeader("Content-Type", "application/json;charset=UTF-8")
  res.send({ state, result })
  return false;
}

// 加密
function encrypt(safe, text) {
  try {
    if (safe === undefined || safe === false) return text
    return safe.encryptString(text).toString('base64')
  } catch (err) {
    console.log('[http] Encrypt error: ' + err)
    return text
  }
}

// 解密
function decrypt(safe, text) {
  try {
    if (safe === undefined || safe === false) return text
    return safe.decryptString(Buffer.from(text, 'base64'))
  } catch (err) {
    console.log('[http] Encrypt error: ' + err)
    return text
  }
}

export default httpService