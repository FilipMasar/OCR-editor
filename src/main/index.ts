import { app, BrowserWindow, ipcMain } from 'electron';
import installDevtools, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer"

import {
  createProject,
  addAltosToProject,
  addImagesToProject,
  getProjectAssetList,
  ProjectAssetList,
  openProject,
  removeAssetFromProject,
} from './project';
import {
  getDonePages,
  getRecentProjects,
  markAsDone,
  removeFromDone,
  removeFromRecentProjects,
  removeWerValues,
  resetDoneProgress,
} from './configData';
import { getPageAssets, saveAlto } from './editor';
import calculateWer from './utils/wer';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const installExtensions = async () => {
  const extensions = [REACT_DEVELOPER_TOOLS];

  return installDevtools(extensions)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
};

const createWindow = async (): Promise<void> => {
  // await installExtensions();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') 
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
let currentProjectPath: string | undefined;
let currentProjectAssets: ProjectAssetList | undefined;

ipcMain.on('project-channel', async (event, data) => {
  if (!mainWindow) {
    console.error('mainWindow is not defined');
    return;
  }

  try {
    switch (data.action) {
      case 'CREATE_PROJECT':
        currentProjectPath = await createProject(mainWindow);
        if (currentProjectPath) {
          event.reply('project-channel', {
            action: 'UPDATE_ASSET_LIST',
            payload: [],
          });
        }
        break;

      case 'OPEN_PROJECT':
        currentProjectPath = await openProject(mainWindow, data.payload);
        if (currentProjectPath) {
          currentProjectAssets = await getProjectAssetList(currentProjectPath);
          event.reply('project-channel', {
            action: 'UPDATE_ASSET_LIST',
            payload: currentProjectAssets,
          });
        }
        break;

      case 'ADD_IMAGES':
        if (!currentProjectPath) throw new Error("Project path isn't defined");
        await addImagesToProject(mainWindow, currentProjectPath);
        resetDoneProgress(currentProjectPath);
        removeWerValues(currentProjectPath);
        currentProjectAssets = await getProjectAssetList(currentProjectPath);
        event.reply('project-channel', {
          action: 'UPDATE_ASSET_LIST',
          payload: currentProjectAssets,
        });
        break;

      case 'ADD_ALTOS':
        if (!currentProjectPath) throw new Error("Project path isn't defined");
        await addAltosToProject(mainWindow, currentProjectPath);
        resetDoneProgress(currentProjectPath);
        removeWerValues(currentProjectPath);
        currentProjectAssets = await getProjectAssetList(currentProjectPath);
        event.reply('project-channel', {
          action: 'UPDATE_ASSET_LIST',
          payload: currentProjectAssets,
        });
        break;

      case 'REMOVE_ASSET':
        if (!currentProjectPath) throw new Error("Project path isn't defined");
        await removeAssetFromProject(
          currentProjectPath,
          data.payload.directory,
          data.payload.name
        );
        resetDoneProgress(currentProjectPath);
        removeWerValues(currentProjectPath);
        currentProjectAssets = await getProjectAssetList(currentProjectPath);
        event.reply('project-channel', {
          action: 'UPDATE_ASSET_LIST',
          payload: currentProjectAssets,
        });
        break;

      case 'MARK_AS_DONE':
        if (!currentProjectPath) throw new Error("Project path isn't defined");
        markAsDone(currentProjectPath, data.payload.index);
        event.reply('project-channel', {
          action: 'WER_UPDATED',
          payload: {
            index: data.payload.index,
            value: calculateWer(
              currentProjectPath,
              data.payload.fileName,
              data.payload.index
            ),
          },
        });
        break;
      case 'REMOVE_FROM_DONE':
        if (!currentProjectPath) throw new Error("Project path isn't defined");
        removeFromDone(currentProjectPath, data.payload.index);
        break;
      default:
        console.log('No function found');
    }
  } catch (error: any) {
    console.error(error);
    event.reply('project-channel', {
      action: 'ERROR',
      payload: error?.message || 'Something went wrong',
    });
  }
});

ipcMain.on('config-channel', async (event, data) => {
  switch (data.action) {
    case 'GET_RECENT_PROJECTS':
      event.reply('config-channel', {
        action: 'RECENT_PROJECTS',
        payload: getRecentProjects(),
      });
      break;
    case 'REMOVE_RECENT_PROJECT':
      removeFromRecentProjects(data.payload);
      event.reply('config-channel', {
        action: 'RECENT_PROJECTS',
        payload: getRecentProjects(),
      });
      break;
    default:
      console.log('No function found');
  }
});

ipcMain.on('editor-channel', async (event, data) => {
  if (currentProjectPath === undefined)
    throw new Error("Project path isn't defined");

  try {
    switch (data.action) {
      case 'GET_PAGE_ASSETS':
        event.reply('editor-channel', {
          action: 'PAGE_ASSETS',
          payload: await getPageAssets(currentProjectPath, data.payload),
        });
        break;
      case 'SAVE_ALTO':
        await saveAlto(
          currentProjectPath,
          data.payload.fileName,
          data.payload.alto
        );
        // eslint-disable-next-line
        const donePages = getDonePages(currentProjectPath);
        if (donePages.includes(data.payload.index)) {
          // recalculate WER
          event.reply('project-channel', {
            action: 'WER_UPDATED',
            payload: {
              index: data.payload.index,
              value: calculateWer(
                currentProjectPath,
                data.payload.fileName,
                data.payload.index
              ),
            },
          });
        }
        event.reply('editor-channel', { action: 'ALTO_SAVED' });
        break;
      default:
        console.log('No function found');
    }
  } catch (error: any) {
    console.error(error);
    event.reply('editor-channel', {
      action: 'ERROR',
      payload: error?.message || 'Something went wrong',
    });
  }
});