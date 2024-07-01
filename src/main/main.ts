import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
const BetterSqlite3 = require('better-sqlite3');

const path = require('path');


let dbPath;


// create a sqlite database using better-sqlite3 all in the main process


function isDev() {
  return !app.isPackaged;
}

async function createDatabase() {
  //create the database
  if (isDev()) {
    dbPath = join(__dirname, 'database.sqlite');
  } else {
    const userDataPath = app.getPath('userData');
    dbPath = join(userDataPath, 'database.sqlite');
  }
  const db = new BetterSqlite3(dbPath);
  console.log('Database created at', dbPath);
  // send dbpath to frontend to use it in the renderer process
  //create a table
  db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)').run();
  //insert some data
  db.prepare('INSERT INTO users (name) VALUES (?)').run('Alice');
  db.prepare('INSERT INTO users (name) VALUES (?)').run('Bob');
 
}
ipcMain.handle('get-db-path', async () => {
  return dbPath;
});

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { 
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(async () => {
  await createDatabase()
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})