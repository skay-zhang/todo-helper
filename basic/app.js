process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

import { app, BrowserWindow, globalShortcut, shell, ipcMain } from 'electron'
import database from './module/database'
import http from './module/http-service'
import { release } from 'os'
import { join } from 'path'

// 禁用Windows7的GPU加速
if (release().startsWith('6.1')) app.disableHardwareAcceleration()
// 设置Windows10+应用名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName())
// 阻止应用程序多开
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
// 屏蔽Electron安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win = null
const preload = join(__dirname, './preload.js')
const indexHtml = join(process.env.DIST, 'index.html')
const url = process.env.VITE_DEV_SERVER_URL
// 创建窗口
async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}
// 应用初始化
async function init(){
  globalShortcut.register('Ctrl+CommandOrControl+T', () => {
    console.log('[app] Listened to shortcut keys')
  });
  // 初始化数据库
  database.init();
  // 启动Http服务
  http.start(app.isPackaged,database);
  console.log('[app] Register shortcuts')
  createWindow();
}
// 应用就绪
app.whenReady().then(init)

// ==================== 以下为事件监听部分 ==================== //

// 窗口全部关闭
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})
// 尝试关闭应用
app.on('before-quit', () => {
  http.stop();
  // 注销快捷键
  globalShortcut.unregisterAll()
  console.log('[app] Unregister shortcuts')
})
// 第二个实例启动
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})
// 激活应用实例
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) allWindows[0].focus()
  else createWindow()
})
// 打开子窗口
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) childWindow.loadFile(indexHtml, { hash: arg })
  else {
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
