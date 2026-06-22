const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

let mainWindow

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '阅读茶宠 - 一边看书一边冒险',
    icon: path.join(__dirname, 'dist', 'favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))

  mainWindow.on('close', () => {
    mainWindow.webContents.send('app-closing')
    setTimeout(() => {
      if (mainWindow) mainWindow.destroy()
      app.exit(0)
    }, 200)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择TXT文件',
    filters: [
      { name: '文本文件', extensions: ['txt', 'text', 'log', 'md', 'csv'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const fileName = path.basename(filePath)

  const encodings = ['utf-8', 'gbk', 'gb2312', 'big5']
  for (const encoding of encodings) {
    try {
      const content = fs.readFileSync(filePath, encoding)
      const replacementChars = (content.substring(0, 1000).match(/\uFFFD/g) || []).length
      if (replacementChars / Math.min(content.length, 1000) < 0.05) {
        return { fileName, content, encoding }
      }
    } catch (e) {
      continue
    }
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return { fileName, content, encoding: 'utf-8' }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  process.exit(0)
})
