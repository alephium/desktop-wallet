/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, shell, nativeImage } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const { autoUpdater } = require('electron-updater')

// Handle deep linking for alephium://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('alephium', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('alephium')
}

contextMenu()

autoUpdater.autoDownload = false

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const gotTheLock = app.requestSingleInstanceLock()

// Build menu

const isMac = process.platform === 'darwin'
const isWindows = process.platform === 'win32'

const template = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }
      ]
    : []),
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      ...(isMac ? [{ role: 'zoom' }, { type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])
    ]
  },
  {
    role: 'help',
    submenu: [
      ...(isMac
        ? []
        : isWindows
        ? [{ role: 'about' }, { type: 'separator' }]
        : [
            {
              label: 'About',
              click: async () => {
                dialog.showMessageBox(mainWindow, {
                  message: `Version ${app.getVersion()}`,
                  title: 'About',
                  type: 'info'
                })
              }
            }
          ]),
      {
        label: 'Report an issue',
        click: async () => {
          await shell.openExternal('https://github.com/alephium/alephium-wallet/issues/new')
        }
      },
      {
        label: 'Get some help',
        click: async () => {
          await shell.openExternal('https://discord.gg/JErgRBfRSB')
        }
      }
    ]
  }
]

function createWindow() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: isWindows ? 'default' : 'hidden',
    webPreferences: {
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  })

  if (!isMac && !isWindows) {
    mainWindow.setIcon(nativeImage.createFromPath(path.join(__dirname, 'icons/logo-48.png')))
  }

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)

  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  }

  // Set default window open handler (open new windows in the web browser by default)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  nativeTheme.on('updated', () =>
    mainWindow.webContents.send('theme:shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
  )

  mainWindow.on('closed', () => (mainWindow = null))

  autoUpdater.on('download-progress', (info) => mainWindow.webContents.send('updater:download-progress', info))

  autoUpdater.on('error', (error) => mainWindow.webContents.send('updater:error', error))

  autoUpdater.on('update-downloaded', (event) => mainWindow.webContents.send('updater:updateDownloaded', event))
}

// Activate the window of primary instance when a second instance starts
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async function () {
    if (isDev) {
      const {
        default: { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS }
      } = await import('electron-devtools-installer')
      await installExtension(REACT_DEVELOPER_TOOLS)
      await installExtension(REDUX_DEVTOOLS)
    }

    ipcMain.handle('theme:setNativeTheme', (_, theme) => (nativeTheme.themeSource = theme))

    // nativeTheme must be reassigned like this because its properties are all computed, so
    // they can't be serialized to be passed over channels.
    ipcMain.handle('theme:getNativeTheme', ({ sender }) =>
      sender.send('theme:getNativeTheme', {
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
        themeSource: nativeTheme.themeSource
      })
    )

    ipcMain.handle('updater:checkForUpdates', async () => {
      const result = await autoUpdater.checkForUpdates()

      return result?.updateInfo?.version
    })

    ipcMain.handle('updater:startUpdateDownload', () => autoUpdater.downloadUpdate())

    ipcMain.handle('updater:quitAndInstallUpdate', () => autoUpdater.quitAndInstall())

    ipcMain.handle('app:hide', () => app.hide())

    ipcMain.handle('app:getSystemLanguage', () => {
      const preferedLanguages = app.getPreferredSystemLanguages()

      if (preferedLanguages.length > 0) return preferedLanguages[0]
    })

    createWindow()
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac) app.quit()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })

  app.on('open-url', (_, url) => {
    const uri = url.replace('alephium://wc?uri=', '')
    mainWindow.webContents.send('wc:connect', uri)
  })
}
