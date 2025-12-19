const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray = null;
let pythonProcess = null;

function createWindow() {
    // Create the browser window for the dashboard
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'DAX-13 Dashboard',
        icon: path.join(__dirname, 'assets/icon.png')
    });

    // Start the Python server
    startPythonServer();

    // Load the dashboard URL
    mainWindow.loadURL('http://localhost:8000');

    // Create a tray icon
    createTray();

    // Handle window close event
    mainWindow.on('closed', function () {
        mainWindow = null;
        if (pythonProcess) {
            pythonProcess.kill();
            pythonProcess = null;
        }
    });

    // Open the DevTools in development
    // mainWindow.webContents.openDevTools();
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets/icon-tray.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Dashboard',
            click: () => {
                if (mainWindow === null) {
                    createWindow();
                } else {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Refresh Data',
            click: () => {
                if (mainWindow) {
                    mainWindow.reload();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                if (pythonProcess) {
                    pythonProcess.kill();
                }
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('DAX-13 Dashboard');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (mainWindow === null) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
}

function startPythonServer() {
    // Path to the Python script
    const scriptPath = path.join(__dirname, '../main.py');
    
    // Start the Python server
    pythonProcess = spawn('python3', [scriptPath]);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Server: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}

// Create the application window when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        if (pythonProcess) {
            pythonProcess.kill();
        }
        app.quit();
    } else {
        // On macOS, we'll just hide the window instead of quitting
        if (mainWindow) {
            mainWindow.hide();
        }
    }
});

// Handle the 'before-quit' event to clean up resources
app.on('before-quit', (event) => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
