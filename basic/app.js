process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, './public')

import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, safeStorage } from 'electron'
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

let mwin = null
let fwin = null
let tray = null
const preload = join(__dirname, './preload.js')
const indexHtml = join(process.env.DIST, 'index.html')
const url = process.env.VITE_DEV_SERVER_URL
// 创建事项管理窗口
async function createManagementWindow() {
  mwin = new BrowserWindow({
    title: '待办助手',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    width: 400,
    height: 600,
    resizable: false,
    skipTaskbar: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#131313',
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (app.isPackaged) {
    mwin.loadFile(indexHtml, {
      query: {
        mode: 'management'
      }
    })
  } else {
    mwin.loadURL(url + '?mode=management')
    mwin.webContents.openDevTools()
  }
}
// 创建快速创建窗口
async function createFastAddWindow() {
  fwin = new BrowserWindow({
    title: '快速创建',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    width: 500,
    height: 300,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#131313',
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (app.isPackaged) {
    fwin.loadFile(indexHtml, {
      query: {
        mode: 'fastAdd'
      }
    })
  } else {
    fwin.loadURL(url + '?mode=fastAdd')
    fwin.webContents.openDevTools()
  }
}
// 初始化菜单
async function initMenu() {
  tray = new Tray(join(process.env.PUBLIC, 'logo/tray.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '快速创建事项',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+C',
      click: () => {
        if (fwin == null) createFastAddWindow();
        else fwin.show()
      }
    },
    { type: 'separator' },
    {
      label: '事项管理',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+A',
      click: () => {
        if (mwin == null) createManagementWindow();
        else mwin.show()
      }
    },
    { type: 'separator' },
    {
      label: '导出月报',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+M',
      click: () => {
        console.log('[app] Listened to CommandOrControl+M')
      }
    },
    {
      label: '导出周报',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+W',
      click: () => {
        console.log('[app] Listened to CommandOrControl+W')
      }
    },
    {
      label: '导出日报',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+D',
      click: () => {
        console.log('[app] Listened to CommandOrControl+D')
      }
    },
    { type: 'separator' },
    { label: '检查更新' },
    {
      label: '偏好设置',
      registerAccelerator: true,
      accelerator: 'CommandOrControl+S',
      click: () => {
        console.log('[app] Listened to CommandOrControl+S')
      }
    },
    { label: '关于', role: 'about' },
    { label: '退出', role: 'quit' }
  ])
  tray.setToolTip('待办助手');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    tray.popUpContextMenu();
  })
}
// 应用初始化
async function init() {
  // MacOS 不显示在dock中
  app.setActivationPolicy('accessory');
  // 设置关于面板信息
  app.setAboutPanelOptions({
    applicationName: '待办助手',
    applicationVersion: app.getVersion(),
    copyright: 'Apache License',
    authors: 'SkayZhang',
    website: 'https://github.com/skay-zhang/todo-helper',
    iconPath: join(process.env.PUBLIC, 'logo/logo.png')
  })
  globalShortcut.register('Ctrl+CommandOrControl+T', () => {
    if (fwin == null) createFastAddWindow();
    else fwin.show()
  });
  // 初始化数据库
  database.init();
  // 初始化安全服务
  let safe = safeStorage.isEncryptionAvailable();
  // 启动Http服务
  http.start(app.isPackaged, database, safe ? safeStorage : false);
  console.log('[app] Register shortcuts')
  initMenu();
}
// 应用就绪
app.whenReady().then(init)
// ==================== 以下为事件监听部分 ==================== //

// 窗口全部关闭
app.on('window-all-closed', () => {
  mwin = null
  fwin = null
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
  if (mwin) {
    if (mwin.isMinimized()) mwin.restore()
    mwin.focus()
  } else if (fwin) {
    if (fwin.isMinimized()) fwin.restore()
    fwin.focus()
  }
})
// 激活应用实例
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) allWindows[0].focus()
  else createManagementWindow()
})
// 打开子窗口
ipcMain.handle('open-win', (_event, arg) => {
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
// 关闭窗口
ipcMain.on('close-window', (_event, name) => {
  if(name === 'fastAdd') fwin.close();
  else if(name === 'management') mwin.close();
})