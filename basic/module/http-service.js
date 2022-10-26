import express from 'express'
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
  start: (dev,db) => {
    console.log('[http] Service start on port ' + httpService.port)
    Server = http.createServer(controller(dev)).listen(httpService.port, () => {
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
function controller(dev) {
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
  // 初始化添加页面
  serve.get('/api/add', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 添加事项
  serve.post('/api/add', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 获取事项列表
  serve.get('/api/list', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 获取事项详情
  serve.get('/api/item/*', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 编辑事项
  serve.post('/api/item/*', (_req, res) => {
    ret(res, true, 'ok')
  });
  // 移除事项
  serve.delete('/api/item/*', (_req, res) => {
    ret(res, true, 'ok')
  });
  serve.use(express.static(path.join(__dirname, dev ? '../client' : '../../public/client')))
  return serve;
}

function ret(res, state, message) {
  res.setHeader("Content-Type", "application/json;charset=UTF-8")
  res.send({ state, message })
  return false;
}

export default httpService