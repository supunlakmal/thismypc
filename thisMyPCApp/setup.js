var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'release-builds/ThisMyPC-win32-ia32',
    outputDirectory: '',
    authors: 'ThisMyPC',
    exe: 'ThisMyPC.exe',

});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));