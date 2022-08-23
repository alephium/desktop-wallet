const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  changeTheme: (theme) => ipcRenderer.invoke('changeTheme', theme),
  onUpdateThemeDark: (cb) => {
    ipcRenderer.on('update:theme:dark', cb)
    return () => ipcRenderer.removeListener('update:theme:dark', cb)
  },
  onUpdateThemeLight: (cb) => {
    ipcRenderer.on('update:theme:light', cb)
    return () => ipcRenderer.removeListener('update:theme:light', cb)
  }
})
