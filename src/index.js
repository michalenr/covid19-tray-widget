const { app, Menu, Tray } = require('electron')
const path = require('path')
const covid = require('novelcovid')

const Store = require('electron-store');
const store = new Store();


const { ipcMain } = require('electron')

const chooseCountryWindow = require('./chooseCountryWindow')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


let tray = null
app.on('ready', () => {
  app.dock.hide()
  tray = new Tray(path.join(__dirname, 'icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Choose Country', click: () => chooseCountryWindow() },
    { label: 'Quit', role: 'quit' }
  ])
  tray.setContextMenu(contextMenu)

  tray.setToolTip('Click to see the menu')


  function formatData(data) {
    const todayCases = data.todayCases !== undefined ? " (" + data.todayCases + "🔺" + ")" : "   "
    return "🦠" + data.cases + todayCases  + "💀" + data.deaths
  }

  async function fetchData(country) {
    store.set('country', country)

    let data
    if (country === 'Global') {
      data = await covid.all()
    } else {
      const allCountries = await covid.countries()
      data = allCountries.find(el => el.country === country)
    }
    tray.setTitle(formatData(data))
  }

  ipcMain.on('country-updated', (event, arg) => {
    fetchData(arg)
  })

  if (!store.get('country')) {
    fetchData('Global')
  } else {
    fetchData(store.get('country'))
  }
})

app.on('window-all-closed', () => {
});