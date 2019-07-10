'use strict';
const socket = io.connect('http://thismypc.com:5000');
const remoteServer = 'http://thismypc.com:5000';
const {
  ipcRenderer,
} = require('electron');
const os = require('os');
const fse = require('fs-extra');
const fs = require('fs');
/* const splitFile = requi;re('split-file')*/
const $ = window.jQuery = require('jquery');
const hddSpace = require('hdd-space');
const {
  machineIdSync,
} = require('node-machine-id');
const computerID = machineIdSync({
  original: true,
});
const computerID2 = machineIdSync();
// console.log(pcID2);
const computerKey = computerID2 + computerID;
let ioSocketID = '';
let userID = '';
let authentication = '';
let applicationKey='';
// folder created    mode
const desiredMode = 0o2775;
const homedir = os.homedir();
let userInfo = {};
const dir = homedir + '\/.thisMyPC';
fs.readFile(dir + '\/thisMyPC.json',
    'utf8',
    /**
   * @param  {object} err
   * @param  {object} data
   */
    function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        userInfo = JSON.parse(data); // now it an object
        console.log(userInfo);
        ioSocketID = userInfo.ioSocketID;
        userID = userInfo.userID;
        authentication = userInfo.authentication;
        applicationKey = userInfo.applicationKey;
        class Home {
        /**
         *  constructor
         */
          constructor() {
            this.homedir = os.homedir();
          }
          /**
         * @param  {string} pathFile
         * get  all file and folder  from path  as  list  to main  left side screen #file-dr-list
         * @return {boolean}
         */
          isFile(pathFile) {
            return fs.statSync(pathFile).isFile();
          }
          /**
         * @param  {number} bytes
         * @param  {string} si
         * get  file all
         * @return {string}
         */
          fileSize(bytes, si) {
            const thresh = si ? 1000 : 1024;
            if (Math.abs(bytes) < thresh) {
              return bytes + ' B';
            }
            const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            let u = -1;
            do {
              bytes /= thresh;
              ++u;
            } while (Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1) + ' ' + units[u];
          }
          /**
         * @param  {object} t
         * @return {string}
         */
          timeStampToDateTimeText(t) {
            return t.getFullYear() + '-' + t.getMonth() + '-' + t.getDay() + ' ' + t.getHours() + ':' + t.getMinutes();
          }
          /**
         * @param  {string} pathFile
         * @return {object}
         */
          fileInfo(pathFile) {
            const property = {};
            const info = fs.statSync(pathFile);
            property.sizeText = this.fileSize(info.size, true);
            property.birthTime = this.timeStampToDateTimeText(info.birthtime);
            property.accessed = this.timeStampToDateTimeText(info.atime);
            property.modified = this.timeStampToDateTimeText(info.mtime);
            return property;
          }
          /**
         * @param  {object} callback
         */
          getHDDList() {
            return new Promise((resolve)=>{
              hddSpace({
                format: 'auto',
              }, function(info) {
                resolve(info);
              });
            }).then((hDDList)=>{
              return hDDList;
            });
          }
          /**
         * User Log Out
         */
          logOut() {}
          /**
         * get user  info
         */
          getUserInfo() {
            const data = {};
            data['id'] = userID;
            data['pcKey'] = computerKey;
            fetch(remoteServer + '/app/myInfo', {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              mode: 'cors', // no-cors, cors, *same-origin
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'token': authentication,
              },
              body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
                .then((response) => response.json()).then(function(response) {
                  if (response.status) {
                    $('#userName').text(response.data.name + ' ' + response.data.nameLast);
                  }
                });
          }
          getPcInfo() {
            const self = this;
            console.log(`${os.totalmem()}${os.uptime()}`);
            const pcInfo = {};
            pcInfo.totalMemory = self.fileSize(os.totalmem(), true);
            // calculate  PC use memory
            pcInfo.useMemory = self.fileSize(os.totalmem()-os.freemem(), true);
            return pcInfo;
          }
          /**
 * Read all contend in given path
 *
 * @param {string} path
 */
          readFolder(path) {
            return new Promise((resolve)=>{
              fse.readdir(path, function(err, content) {
                if (err) {
                  console.log(err);
                  resolve(false);
                } else {
                  resolve(content);
                }
              });
            }).then((data)=>{
              return data;
            });
          }
          /**
           * check given path is file or  system file that cant access using this app
           *
           * @param {string} path
           */
          isThisFile(path) {
            return new Promise((resolve)=>{
              fse.ensureFile(path, (err) => {
                if (err) {
                  resolve(false);
                } else {
                  resolve(true);
                }
              });
            }).then((result)=>{
              return result;
            });
          }
          /**
         * Initialize  functions
         */
          install() {
            this.getUserInfo();
            this.logOut();
          }
        }
        const homeClass = new Home();
        console.log(os);
        console.log(os.platform());
        homeClass.install();
        socket.emit('joinFromApp', {
          data: {
            id: userID,
            auth: authentication,
            ioSocketID: ioSocketID,
            pcKey: computerKey,
          },
        });
        /**
       * @param  {} 'pcInfoRequest'
       * @param  {} function(data)
       * send pc  information  to web end
       */
        socket.on('pcInfoRequest', function(data) {
          socket.emit('pcInfo', {
            id: userID,
            auth: authentication,
            pcKey: computerKey,
            pcInfo: homeClass.getPcInfo(),
          });
        });
        // this is  privet   message
        socket.on('pcAccessRequest', async function(data) {
          console.log(data);
          if (data.status) {
            $('#remoteUserBox').html(`
<div class="row align-items-center">
<div class="col-2"><i class="fas fa-circle-notch  fa-spin"></i></div>
<div class="col-10">
  <div class="font-weight-bolder">
  ${data.name} ${data.nameLast} 
  ${data.userID === userID ? '<span class="badge badge-pill badge-success">You</span>' : ''}</div>
                                        <div class="font-weight-light">${data.email}</div></div>
</div>
`);
            const hDDList = await homeClass.getHDDList();
            socket.emit('hDDList', {
              id: userID,
              auth: authentication,
              pcKey: computerKey,
              data: hDDList,
            });
          } else {
            $('#remoteUserBox').html(`<div class="font-weight-bolder">
            User Not Available
            </div>`);
          }
        });
        socket.on('openFolderRequest', async function(data) {
        // homeClass.openFolderRequest(data, function (err, callback) {
          const homedir = data.path;
          const folderContent = await  homeClass.readFolder(homedir);
          if (folderContent) {
            for (const file of folderContent) {
              const path = homedir + '\\' + file;
              // test if  path folder  or file
              const folderSubContent = await homeClass.readFolder(path);
              let sendEmit =true;
              if (!folderSubContent) {
                const ensureFile = await homeClass.isThisFile(path);
                if (!ensureFile) {
                  sendEmit =false;
                }
              }
              if (sendEmit) {
                const fileObject = {};
                const fileInfo = homeClass.fileInfo(path);
                const filetype = homeClass.isFile(path);
                fileObject.path = `${homedir}\\${file}`;
                fileObject.file = filetype;
                fileObject.fileName = file;
                fileObject.fileInfo = fileInfo;
                socket.emit('sendOpenFolderRequest', {
                  id: userID,
                  auth: authentication,
                  pcKey: computerKey,
                  room: ioSocketID,
                  data: fileObject,
                });
                console.log('new emit 2', fileObject);
              }
            }
          }
        });
        // validate folder name before  create
        socket.on('validateFolderName', function(data) {
          console.log(data);
          const dir = `${data.path}\\${data.createFolderName}`;
          fs.stat(dir, function(err, stats) {
            if (err) {
              console.log(dir);
              fse.ensureDir(dir, desiredMode)
                  .then(() => {
                    console.log('success!');
                    socket.emit('folderCreateCallback', {
                      id: userID,
                      auth: authentication,
                      pcKey: computerKey,
                      data: {
                        status: true,
                        message: 'Folder Create Successful',
                      },
                    });
                  })
                  .catch((err) => {});
            } else {
              if (stats.isDirectory()) {
                socket.emit('folderCreateCallback', {
                  id: userID,
                  auth: authentication,
                  pcKey: computerKey,
                  data: {
                    status: false,
                    message: 'Please try different folder name',
                  },
                });
              }
            }
          });
        });
        $('#submit-logout').click(function name(params) {
          ipcRenderer.send('loginPage');
          const data = {};
          data['id'] = userID;
          data['auth'] = authentication;
          fetch(remoteServer + '/app/logout', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            headers: {
              // "Content-Type": "application/x-www-form-urlencoded",
              'Content-Type': 'application/json; charset=utf-8',
            },
            // body data type must match "Content-Type" header
            body: JSON.stringify(data),
          })
              .then((response) => response.json()).then(function(response) {
                if (response.status) {}
              });
        });
      }
    });