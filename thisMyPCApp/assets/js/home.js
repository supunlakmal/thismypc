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
const pcID = machineIdSync({
  original: true,
});
const pcID2 = machineIdSync();
// console.log(pcID2);
const pcKey = pcID2 + pcID;
let ioSocketID = '';
let id = '';
let auth = '';
let appKey = '';
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
        id = userInfo.id;
        auth = userInfo.auth;
        appKey = userInfo.appKey;
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
          getHDDList(callback) {
            hddSpace({
              format: 'auto',
            }, function(info) {
              callback(info);
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
            data['id'] = id;
            data['pcKey'] = pcKey;
            fetch(remoteServer + '/app/myInfo', {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              mode: 'cors', // no-cors, cors, *same-origin
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'token': auth,
              },
              body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
                .then((response) => response.json()).then(function(response) {
                  if (response.status) {
                    $('#userName').text(response.data.name + ' ' + response.data.nameLast);
                  }
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
            id: id,
            auth: auth,
            ioSocketID: ioSocketID,
            pcKey: pcKey,
          },
        });
        // this is  privet   message
        socket.on('pcAccessRequest', function(data) {
          console.log(data);
          if (data.status) {
            $('#remoteUserBox').html(`
<div class="row align-items-center">
<div class="col-2"><i class="fas fa-circle-notch  fa-spin"></i></div>
<div class="col-10">
  <div class="font-weight-bolder">
  ${data.name} ${data.nameLast} 
  ${data.userID === id ? '<span class="badge badge-pill badge-success">You</span>' : ''}</div>
                                        <div class="font-weight-light">${data.email}</div></div>
</div>
`);
            homeClass.getHDDList(function(callback) {
              socket.emit('hDDList', {
                id: id,
                auth: auth,
                pcKey: pcKey,
                data: callback,
              });
            });
          } else {
            $('#remoteUserBox').html(`<div class="font-weight-bolder">
            User Not Available
            </div>`);
          }
        });
        socket.on('openFolderRequest', function(data) {
        // homeClass.openFolderRequest(data, function (err, callback) {
          const homedir = data.path;
          fse.readdir(homedir, function(err, content) {
            if (err) {} else {
              for (const file of content) {
                const path = homedir + '\\' + file;
                // test if  path folder  or file
                fse.readdir(path, function(err, content) {
                  const fileObject = {};
                  if (err) {
                    fse.ensureFile(path, (err) => {
                      if (!err) {
                        const fileInfo = homeClass.fileInfo(path);
                        const filetype = homeClass.isFile(path);
                        // file object send
                        fileObject.path = `${homedir}\\${file}`;
                        fileObject.file = filetype;
                        fileObject.fileName = file;
                        fileObject.fileInfo = fileInfo;
                        socket.emit('sendOpenFolderRequest', {
                          id: id,
                          auth: auth,
                          room: ioSocketID,
                          pcKey: pcKey,
                          data: fileObject,
                        });
                        console.log('new emit 2', fileObject);
                      }
                    });
                  } else {
                    const fileInfo = homeClass.fileInfo(path);
                    const filetype = homeClass.isFile(path);
                    // file object send
                    fileObject.path = `${homedir}\\${file}`;
                    fileObject.file = filetype;
                    fileObject.fileName = file;
                    fileObject.fileInfo = fileInfo;
                    socket.emit('sendOpenFolderRequest', {
                      id: id,
                      auth: auth,
                      room: ioSocketID,
                      pcKey: pcKey,
                      data: fileObject,
                    });
                    console.log('new emit', fileObject);
                  }
                });
              }
            }
          });
        // });
        });
        socket.on('copyPasteToPCApp', function(data) {
          console.log(data);
          // ToDO  only files can be copy
          fse.copy(data.copyPathSet, data.pastePathSet, (err) => {
            if (err) {
              return console.error(err);
            } else {
            // copy done Emit
              socket.emit('pasteDone', {
                id: id,
                auth: auth,
                pcKey: pcKey,
                data: true,
              });
              console.log('success!');
            }
          });
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
                      id: id,
                      auth: auth,
                      pcKey: pcKey,
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
                  id: id,
                  auth: auth,
                  pcKey: pcKey,
                  data: {
                    status: false,
                    message: 'Please try different folder name',
                  },
                });
              }
            }
          });
        });
        // app center
        $('body').on('click', '.install-btn', function(e) {
        // code
          const self = $(this);
          const appID = self.attr('data-appID');
          self.removeClass('install-btn');
          self.children('.need-to-install').remove();
          self.prepend(`<i class="fas fa-sync-alt fa-spin  on-install"></i>`);
          homeClass.appInstall(appID, function(data) {
            self.html('<i class="fas fa-check-circle"></i> Done');
          });
        });
        $('#submit-logout').click(function name(params) {
          ipcRenderer.send('loginPage');
          const data = {};
          data['id'] = id;
          data['auth'] = auth;
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
