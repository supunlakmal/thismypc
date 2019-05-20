"use strict";
let socket = io.connect('http://thismypc.com:5000');
let remoteServer = "http://thismypc.com:5000";
const {
    ipcRenderer
} = require('electron');
const os = require('os');
let remote = require('electron').remote;
const fse = require('fs-extra');
let fs = require('fs');
const path = require('path');
/*const splitFile = requi;re('split-file')*/
const ioStream = require('socket.io-stream');
const $ = window.jQuery = require("jquery");
let hddSpace = require('hdd-space');
const {machineId, machineIdSync} = require('node-machine-id');
var FileAPI = require('file-api'), File = FileAPI.File, FileList = FileAPI.FileList, FileReader = FileAPI.FileReader;
const pcID = machineIdSync({original: true});
const pcID2 = machineIdSync();
//console.log(pcID2);
const pcKey = pcID2 + pcID;
let ioSocketID = '';
let id = '';
let auth = '';
let appKey = '';
let incomingFileInfo;
let incomingFileData;
let bytesReceived;
let downloadInProgress = false;
//folder created    mode
const desiredMode = 0o2775;
const homedir = os.homedir();
let userInfo = {};
let dir = homedir + '\/.thisMyPC';
fs.readFile(dir + '\/thisMyPC.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {
        userInfo = JSON.parse(data); //now it an object
        console.log(userInfo);
        ioSocketID = userInfo.ioSocketID;
        id = userInfo.id;
        auth = userInfo.auth;
        appKey = userInfo.appKey;
//let a = 0;
//setInterval(function(){  socket.emit('folderList', { my: a });  a++;}, 3000);
        class home {
            constructor(e) {
                this.homedir = os.homedir();
            }

            // get  all file and folder  from path  as  list  to main  left side screen #file-dr-list
            isFile(pathFile) {
                return fs.statSync(pathFile).isFile();
            }

// get  file all info
            fileSize(bytes, si) {
                var thresh = si ? 1000 : 1024;
                if (Math.abs(bytes) < thresh) {
                    return bytes + ' B';
                }
                var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
                var u = -1;
                do {
                    bytes /= thresh;
                    ++u;
                } while (Math.abs(bytes) >= thresh && u < units.length - 1);
                return bytes.toFixed(1) + ' ' + units[u];
            }

            timeStampToDateTimeText(t) {




                //  console.log(t);
                /*
                        console.log(t.getFullYear());
                        console.log(t.getMonth());
                        console.log(t.getDay());
                        console.log(t.getHours());
                        console.log(t.getMinutes());

                        */
                return t.getFullYear() + '-' + t.getMonth() + '-' + t.getDay() + ' ' + t.getHours() + ':' + t.getMinutes();
            }

            fileInfo(pathFile) {
                let property = {};
                let info = fs.statSync(pathFile);
                property.sizeText = this.fileSize(info.size, true);
                property.birthTime = this.timeStampToDateTimeText(info.birthtime);
                property.accessed = this.timeStampToDateTimeText(info.atime);
                property.modified = this.timeStampToDateTimeText(info.mtime);
                return property;
            }

            //is  file  exist  on  paste  location
            checkFileOnPasteLocation(src, dest) {
                // your logic here
                // it will be copied if return true
                return true;
            }






            startDownload(data) {
                incomingFileInfo = JSON.parse(data.toString());
                incomingFileData = [];
                bytesReceived = 0;
                downloadInProgress = true;
                console.log('incoming file <b>' + incomingFileInfo.fileName + '</b> of ' + incomingFileInfo.fileSize + ' bytes');
                $("#download-box").html(`<div class="progress ">
                    <div id="progress-bar-download" class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${incomingFileInfo.fileName} <span id="download-percentage">0%</span></div>
                </div>`);
            }

            endDownload() {
                downloadInProgress = false;
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                var blob = new Blob(incomingFileData);
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = incomingFileInfo.fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            }

            progressDownload(data) {
                let self = this;
                bytesReceived += data.byteLength;
                incomingFileData.push(data);
                //  console.log('progress: ' + ((bytesReceived / incomingFileInfo.fileSize ) * 100).toFixed(2) + '%');
                let progress = ((bytesReceived / incomingFileInfo.fileSize ) * 100).toFixed(2);
                $("body #download-percentage").text(progress + '%');
                $("body #progress-bar-download").css('width', progress + '%');
                if (bytesReceived === incomingFileInfo.fileSize) {
                    self.endDownload();
                }
            }


            getHDDList(callback) {
                hddSpace({format: 'auto'}, function (info) {
                    callback(info);
                });
            }



            logOut() {
            }

            // get user  info
            getUserInfo() {
                let data = {};
                data['id'] = id;
                data['pcKey'] = pcKey;
                fetch(remoteServer+"/app/myInfo", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    headers: {
                        "Content-Type": "application/json; charset=utf-8", "token": auth,
                    }, body: JSON.stringify(data), // body data type must match "Content-Type" header
                })
                    .then(response => response.json()).then(function (response) {
                    if (response.status) {
                        $("#userName").text(response.data.name + ' ' + response.data.nameLast);
                    }
                });
            }

            // get  notification  for  user  and   app
            appNotifcation() {
                let data = {};
                data['id'] = id;
                data['pcKey'] = pcKey;
                data['appKey'] = appKey;
                fetch(remoteServer+"/app/notification", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    headers: {
                        "Content-Type": "application/json; charset=utf-8", "token": auth,
                    }, body: JSON.stringify(data), // body data type must match "Content-Type" header
                })
                    .then(response => response.json()).then(function (response) {
                    if (response.status) {


                        //   $("#userName").text(response.data.name+' '+ response.data.nameLast);
                    }
                });
            }

            //  Install  app store
            appInstall(appID, callback) {
                let data = {};
                data['id'] = id;
                data['pcKey'] = pcKey;
                data['appKey'] = appKey;
                data['appID'] = appID;
                fetch(remoteServer+"/store/app/install", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    headers: {
                        "Content-Type": "application/json; charset=utf-8", "token": auth,
                    }, body: JSON.stringify(data), // body data type must match "Content-Type" header
                })
                    .then(response => response.json()).then(function (response) {
                    console.log(response);
                    callback(response);
                    /*  if (response.status) {



                          //   $("#userName").text(response.data.name+' '+ response.data.nameLast);
                      }*/
                });
            } //  get app store
            appStore() {
                let data = {};
                data['id'] = id;
                data['pcKey'] = pcKey;
                data['appKey'] = appKey;
                data['limit'] = 6;
                fetch(remoteServer+"/store/app", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    headers: {
                        "Content-Type": "application/json; charset=utf-8", "token": auth,
                    }, body: JSON.stringify(data), // body data type must match "Content-Type" header
                })
                    .then(response => response.json()).then(function (response) {

                    // console.log(response);
                    let html = '';
                    response.data.forEach(function (item) {
                        // console.log(item);
                        html += ` <div class="col-xl-4 col-md-4 ">
                            <div class="box  ">
                                <div class="row">
                                    <div class="col-xl-12 col-md-12 app-store-img"><img
                                            src="http://thismypc.com/${item.appImageUrl}"
                                            alt="" class="img-fluid"></div>
                                    <div class="col-xl-12 col-md-12 app-store-title mt-2">${item.appName}</div>
                                    <div class="col-xl-12 col-md-12 app-store-info">${item.appInfo} </div>

                                    <div class="col-xl-12 col-md-12 app-store-install mt-2">
                                        <div class="row">
                                            <div class="col-md-6"><i class="fas fa-user"></i> ${item.appInstallCount}+</div>
                                            <div class="col-md-6 "><button type="button"
                                                    class="btn btn-success btn-circle install-btn" data-appID="${item._id}"><i
                                                         class="far fa-arrow-alt-circle-down need-to-install"></i> Install</button></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    });
                    $("#app_store_data").html(html);
                    /*  if (response.status) {



                          //   $("#userName").text(response.data.name+' '+ response.data.nameLast);
                      }*/
                });
            }
            appStoreInstalled() {
                let data = {};
                data['id'] = id;
                data['pcKey'] = pcKey;
                data['appKey'] = appKey;
                data['limit'] = 6;
                fetch(remoteServer+"/store/app/myApp", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    headers: {
                        "Content-Type": "application/json; charset=utf-8", "token": auth,
                    }, body: JSON.stringify(data), // body data type must match "Content-Type" header
                })
                    .then(response => response.json()).then(function (response) {

                    console.log(response);
                   let html = '';
                    response.data.forEach(function (item) {
                        // console.log(item);
                        html += `        <div class="col-xl-3 col-md-3 app ">
                                    <div class="box mouse ">
                                        <div class="row">
                                            <div class="col-xl-3 col-md-3">
                                                <img
                                            src="http://thismypc.com/${item.apps[0].appIconUrl}"
                                            alt="" class="img-fluid"></div>
                                            <div class="col-xl-7 col-md-7 app-store-text">${item.apps[0].appName}</div>
                                            
                                            
                                            <div class="col-xl-2 col-md-2 align-self-center"><i class="fas fa-trash-alt"></i></div>
                                            
                                        </div>
                                    </div>
                                </div>`;
                    });
                    $("#myApps").html(html);

                });
            }

            install() {
               // this.appStore();
               // this.appStoreInstalled();
                this.getUserInfo();
                this.logOut();
            }
        }

        let config = {
            'os': os
        }
        let homeClass = new home(config);
        console.log(os);
        console.log(os.platform());
        homeClass.install();
        socket.emit('joinFromApp', {data: {id: id, auth: auth, ioSocketID: ioSocketID, pcKey: pcKey}});
        /*



        socket.on('getAppData', function (data) {
            console.log("appDATA Start");
            // homeClass.getList(function (err, callback) {
            //socket.emit('sendList', {id: id, auth: auth, room: ioSocketID, data: callback});
            // });
            homeClass.getHDDList(function (callback) {
                console.log(callback);
                // socket.emit('hDDList', callback);
                socket.emit('hDDList', {id: id, auth: auth, room: ioSocketID, data: callback});
            });
        });
        // TODO this  function  have  big  lag  need to  refine  it for speed  up
        socket.on('openFolderRequest', function (data) {
            // homeClass.openFolderRequest(data, function (err, callback) {
            let homedir = data.path;
            fse.readdir(homedir, function (err, content) {
                if (err) {
                } else {
                    for (let file of content) {
                        let path = homedir + '\\' + file;


                        // test if  path folder  or file

                        fse.readdir(path, function (err, content) {
                            let fileObject = {}
                            if (err) {
                                fse.ensureFile(path, err => {
                                    if (!err) {
                                        let fileInfo = homeClass.fileInfo(path);
                                        let filetype = homeClass.isFile(path);
                                        //file object send
                                        fileObject.path = `${homedir}\\${file}`;
                                        fileObject.file = filetype;
                                        fileObject.fileName = file;
                                        fileObject.fileInfo = fileInfo;
                                        socket.emit('sendOpenFolderRequest', {
                                            id: id, auth: auth, room: ioSocketID, data: fileObject
                                        });
                                        console.log('new emit 2', fileObject);
                                    }
                                })
                            } else {
                                let fileInfo = homeClass.fileInfo(path);
                                let filetype = homeClass.isFile(path);
                                //file object send
                                fileObject.path = `${homedir}\\${file}`;
                                fileObject.file = filetype;
                                fileObject.fileName = file;
                                fileObject.fileInfo = fileInfo;
                                socket.emit('sendOpenFolderRequest', {id: id, auth: auth, room: ioSocketID, data: fileObject});
                                console.log('new emit', fileObject);
                            }
                        });
                    }
                }
            })
            // });
        });
        /!**
         * if  file  it must rename
         *!/
        socket.on('copyPasteToPCApp', function (data) {
            console.log(data);
        // ToDO  only files can be copy
            //{filter:homeClass.checkFileOnPasteLocation()}
            fse.copy(data.copyPathSet, data.pastePathSet, err => {
                if (err) {
                    return console.error(err)
                } else {
        //copy done Emit
                    socket.emit('pasteDone', {id: id, auth: auth, data: true});
                    console.log('success!')
                }
            })
        });
        /!**
         * File  download from  webb
         *!/
        socket.on('uploadFileInfo_from_web', function (data) {
            //console.log(data);
            homeClass.startDownload(data);
        });
        socket.on('uploadFile_chunk_from_web', function (data) {
            //console.log(data);
            homeClass.progressDownload(data);
        });*/
// this is  privet   message
        socket.on('pcAccessRequest', function (data) {
            console.log(data);
            if (data.status) {
                $("#remoteUserBox").html(`


<div class="row align-items-center">

<div class="col-2"><i class="fas fa-circle-notch  fa-spin"></i></div>

<div class="col-10">
  <div class="font-weight-bolder">${data.name} ${data.nameLast}   ${data.userID === id ? '<span class="badge badge-pill badge-success">You</span>' : ''}</div>
                                        <div class="font-weight-light">${data.email}</div></div>

</div>

`);
                // homeClass.getList(function (err, callback) {
                //socket.emit('sendList', {id: id, auth: auth, room: ioSocketID, data: callback});
                // });
                homeClass.getHDDList(function (callback) {
                    //  console.log(callback);
                    // socket.emit('hDDList', callback);
                    socket.emit('hDDList', {id: id, auth: auth, pcKey: pcKey, data: callback});
                });
            } else {
                $("#remoteUserBox").html(`<div class="font-weight-bolder">User Not Available</div>`);
            }
        });
        socket.on('openFolderRequest', function (data) {
            // homeClass.openFolderRequest(data, function (err, callback) {
            let homedir = data.path;
            fse.readdir(homedir, function (err, content) {
                if (err) {
                } else {
                    for (let file of content) {
                        let path = homedir + '\\' + file;
                        // test if  path folder  or file
                        fse.readdir(path, function (err, content) {
                            let fileObject = {}
                            if (err) {
                                fse.ensureFile(path, err => {
                                    if (!err) {
                                        let fileInfo = homeClass.fileInfo(path);
                                        let filetype = homeClass.isFile(path);
                                        //file object send
                                        fileObject.path = `${homedir}\\${file}`;
                                        fileObject.file = filetype;
                                        fileObject.fileName = file;
                                        fileObject.fileInfo = fileInfo;
                                        socket.emit('sendOpenFolderRequest', {
                                            id: id, auth: auth, room: ioSocketID, pcKey: pcKey, data: fileObject
                                        });
                                        console.log('new emit 2', fileObject);
                                    }
                                })
                            } else {
                                let fileInfo = homeClass.fileInfo(path);
                                let filetype = homeClass.isFile(path);
                                //file object send
                                fileObject.path = `${homedir}\\${file}`;
                                fileObject.file = filetype;
                                fileObject.fileName = file;
                                fileObject.fileInfo = fileInfo;
                                socket.emit('sendOpenFolderRequest', {
                                    id: id, auth: auth, room: ioSocketID, pcKey: pcKey, data: fileObject
                                });
                                console.log('new emit', fileObject);
                            }
                        });
                    }
                }
            })
            // });
        });
        socket.on('copyPasteToPCApp', function (data) {
            console.log(data);
// ToDO  only files can be copy
            //{filter:homeClass.checkFileOnPasteLocation()}
            fse.copy(data.copyPathSet, data.pastePathSet, err => {
                if (err) {
                    return console.error(err)
                } else {
//copy done Emit
                    socket.emit('pasteDone', {id: id, auth: auth, pcKey: pcKey, data: true});
                    console.log('success!')
                }
            })
        });
        /**
         * File  download from  webb
         */
        socket.on('uploadFileInfo_from_web', function (data) {
            //console.log(data);
            homeClass.startDownload(data);
        });
        socket.on('uploadFile_chunk_from_web', function (data) {
            //console.log(data);
            homeClass.progressDownload(data);
        });
// remote user ask for  some  file to  download
        socket.on('downloadFileRequest', function (data) {
            console.log(data);
            /* //let file = fs.statSync(data.path);
             splitFile.splitFileBySize(data.path, 1048576)
                 .then((names) => {
                     console.log(names);
                 })
                 .catch((err) => {
                     console.log('Error: ', err);
                 });



             splitFile.mergeFiles(names, __dirname + '/testfile-output.bin')
                 .then(() => {
                     console.log('Done!');
                 })
                 .catch((err) => {
                     console.log('Error: ', err);
                 });

            */
        });
        //validate folder name before  create
        socket.on('validateFolderName', function (data) {
            console.log(data);
            let dir = `${data.path}\\${data.createFolderName}`;
            fs.stat(dir, function (err, stats) {
                if (err) {
                    console.log(dir);
                    fse.ensureDir(dir, desiredMode)
                        .then(() => {
                            console.log('success!');
                            socket.emit('folderCreateCallback', {
                                id: id,
                                auth: auth,
                                pcKey: pcKey,
                                data: {status: true, message: 'Folder Create Successful'}
                            });
                        })
                        .catch(err => {
                        })
                } else {
                    if (stats.isDirectory()) {
                        socket.emit('folderCreateCallback', {
                            id: id,
                            auth: auth,
                            pcKey: pcKey,
                            data: {status: false, message: 'Please try different folder name'}
                        });
                    }
                }
            });
        });
        // app center
        $('body').on('click', '.install-btn', function (e) {
            //code
            let self = $(this);
            let appID = $(this).attr('data-appID');
            $(this).removeClass('install-btn');
            $(this).children(".need-to-install").remove();
            $(this).prepend(`<i class="fas fa-sync-alt fa-spin  on-install"></i>`);
            homeClass.appInstall(appID, function (data) {
                self.html('<i class="fas fa-check-circle"></i> Done');
            });
        });
        $('#submit-logout').click(function name(params) {
            ipcRenderer.send('loginPage');
            let data = {};
            data['id'] = id;
            data['auth'] = auth;
            fetch(remoteServer+"/app/logout", {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, cors, *same-origin
                headers: {
                    "Content-Type": "application/json; charset=utf-8", // "Content-Type": "application/x-www-form-urlencoded",
                }, body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
                .then(response => response.json()).then(function (response) {
                if (response.status) {
                }
            });
        });
    }
});
