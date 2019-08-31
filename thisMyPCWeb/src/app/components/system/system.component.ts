import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router,
  RouterModule,
  Routes
} from '@angular/router';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import * as io from 'socket.io-client';
import * as $ from 'jquery';
import {
  config
} from '../config/config'
import {
  ConnectionService
} from 'ng-connection-service';
@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {
  socket: SocketIOClient.Socket;
  // alert
  alert: any = [];
  // Hard Disk list
  hDDList: any = [];
  // folder list
  folderList = [];
  // folder  menu option
  folderInfo: any = [];
  // open folder or hhd path (name)
  openFolderName = '';
  // open folder or hhd path
  openFolderPath = '';
  //top breadcrumb folder
  breadcrumbObject: any = [];
  //  crete  folder  name
  createFolderName = '';
  //createFolderNameErrorMsg
  createFolderNameErrorMsg = '';
  /**
   * User Info
   */
  user: any = [];
  /*
   * This  is  main  open  folder
   * it can  be hdd  or  folder
   *
   * TODO  This  function need to be done*/
  // test user is online or  offline
  isConnected = true;
  /**
   * All My pc
   */
  pcs: any = [];
  // other  one pc key
  publicPcKey = '';
  // folder  or  file  property (Info )
  property: any = [];
  //user selected PC  ID
  selectedPC_ID = '';
  // is  pc drop  down selected
  pcSelect = false;
  //pc info 
  pcInfoData: any = [];
  // post Header
  headers: any = '';

  // file  download option
  startDownload =false;
  downloadFileSize=0;
  fileChunkStart =0;
  fileChunk=0;
  fileName='';
  fileDataArray = [];


  /**
   *
   * param {HttpClient} http
   * param {Router} router
   */
  constructor(private http: HttpClient, private router: Router, private connectionService: ConnectionService) {
    const self = this;
    self.socket = io.connect(`${config.url}${config.port}`);
    self.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        self.alert.openAlert = true;
        self.alert.class = 'alert-success';
        self.alert.massage = ` <i class="fas fa-thumbs-up"></i></i> <strong> Internet Connection  back Online..</strong> `;
      } else {
        self.alert.openAlert = true;
        self.alert.class = 'alert-danger';
        self.alert.massage = ` <i class="fas fa-sync-alt fa-spin"></i> <strong> Internet Connection Lost..</strong> `;
      }
    });
  }
  /**
   * Top right corner alert
   * 
   * @param  {object} e
   */
  processAlert(e) {
    const self = this;
    self.alert.openAlert = e;
    self.alert.class = 'alert-primary';
    self.alert.massage = ` <i class="fas fa-sync-alt fa-spin"></i> <strong>Progress... </strong> `;
  }
  // TODO need to test this on linux and macOX
  breadcrumb(path) {
    const self = this;
    self.breadcrumbObject = [];
    //separate foldername and path
    let customPathArray = path.split("//\\");
    //user click path
    let clickPath = '';
    customPathArray.forEach(function (name) {
      clickPath = clickPath + name + '//\\';
      let customPath: any = []
      customPath.name = name;
      customPath.path = clickPath;
      self.breadcrumbObject.push(customPath)
    });
  }
  ngOnInit() {
    const self = this;
    // send  user auth and  test
    const sendData = {};
    sendData['userID'] = sessionStorage.getItem('userID');
    console.log(JSON.stringify(sendData));
    self.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('authentication_key', sessionStorage.getItem('authentication_key') ? sessionStorage.getItem('authentication_key') : 'thismyPc');
    const headers = self.headers;
    self.http.post(`${config.url}${config.port}/api/v1/user/authentication`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {},
        response => {
          // if offline
          self.router.navigate(['/login']);
        },
        () => {
          console.log('The POST observable is now completed.');
        });
    self.http.get(`${config.url}${config.port}/api/v1/user/${sendData['userID']}`, {
        headers
      })
      .subscribe(
        (val: any) => {
          self.user = val.data;
          console.log(val);
        },
        response => {},
        () => {});
    // app start
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    self.socket.emit('joinFromWeb', {
      data: {
        userID: userID,
        authentication_key: authentication_key
      }
    });
    self.socket.on('hDDList', function (data) {
      self.hDDList = data;
      console.log(data.parts);
      self.processAlert(false);
    });
    self.socket.on('openFolderRequestToWeb', function (data) {
      self.processAlert(false);
      console.log(data, 'openlist');
      self.folderList.push(data);
    });
    self.socket.on('pasteDone', function (data) {
      self.alert.openAlert = true;
      self.alert.class = 'alert-success';
      self.alert.massage = ` <strong> Paste Done </strong> `;
    });
    self.http.post(`${config.url}${config.port}/api/v1/user/computer/online`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          self.pcs = val.data;
          console.log(val);
        },
        response => {},
        () => {});
    self.socket.on('folderCreateCallbackToWeb', function (data) {
      self.alert.openAlert = true;
      if (data.status) {
        self.alert.class = 'alert-success';
        self.alert.massage = ` <strong> ${data.message} </strong> `;
      } else {
        self.alert.class = 'alert-danger';
        self.alert.massage = ` <strong> ${data.message}  </strong> `;
      }
    });
    //  pcInfoRequest
    self.socket.on('pcInfo', function (data) {
      self.pcInfoData = data;
      console.log(data);
      self.processAlert(false);
    });

    self.socket.on('downloadFileInfoSendToWeb', function (data) {
 
    self.fileChunkStart =0;
    self.fileDataArray = [];
    self.startDownload =true;
    self.downloadFileSize =data.size;
    self.fileChunk =data.chunks;
    self.fileName = data.filename;
    });



    self.socket.on('sendFileChunksToWeb', function (data) {
      if(self.startDownload ){
        self.fileDataArray.push(data);
          if(self.fileChunk ==self.fileChunkStart){
            var a = document.createElement("a");
            document.body.appendChild(a);
          // a.style = "display: none";
            var blob = new Blob(self.fileDataArray);
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = self.fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            self.fileChunkStart =0;
            self.startDownload =false;
            self.fileDataArray = [];
            }
        self.fileChunkStart++;
      }
    });
  }
  /**
   *
   * param path
   */
  openDrive(path, i) {
    this.processAlert(true);
    // alert(this.publicPcKey);
    const pcKeyPublic = this.publicPcKey;
    // jquary code
    $('.main-hdd-box').removeClass('box-active');
    $('#click_' + i).addClass('box-active');
    console.log(path);
    this.openFolderName = path;
    this.breadcrumb(path);
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    console.log(authentication_key);
    this.folderList = [];
    this.socket.emit('openFolder', {
      path: path + '//',
      authentication_key: authentication_key,
      userID: userID,
      pcKeyPublic: pcKeyPublic
    });
  }
  openFolder(path, fileName) {
    this.processAlert(true);
    const pcKeyPublic = this.publicPcKey;
    this.openFolderName = fileName;
    this.breadcrumb(path);
    this.openFolderPath = path;
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    this.folderList = [];
    this.socket.emit('openFolder', {
      path: path + '//',
      authentication_key: authentication_key,
      userID: userID,
      pcKeyPublic: pcKeyPublic
    });
  }
  // get file  or  folder  info  add    to  new  variable
  fileOption(info) {
    this.folderInfo = info;
  }
  // logout System
  logout() {
    const userID = sessionStorage.getItem('userID');
    const self = this;
    const headers = self.headers;
    self.http.get(`${config.url}${config.port}/api/v1/user/${userID}/computer/logout`, {
        headers
      })
      .subscribe(
        (val: any) => {
          this.router.navigate(['/login']);
        },
        response => {
          this.router.navigate(['/login']);
        },
        () => {
          this.router.navigate(['/login']);
        });
  }
  // select Pc from drop down
  selectPC(pcID) {
    this.folderList = [];
    this.hDDList = [];
    this.openFolderName = '';
    this.processAlert(true);
    this.publicPcKey = '';
    console.log(pcID);
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    this.socket.emit('pcAccessRequest', {
      pcID: pcID,
      authentication_key: authentication_key,
      userID: userID
    });
    this.pcSelect = true;
    this.selectedPC_ID = pcID;
    this.socket.emit('pcInfoRequest', {
      pcID: pcID,
      authentication_key: authentication_key,
      userID: userID
    });
  }
  //  get  pc  information   
  pcInfo() {
    this.processAlert(true);
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    const pcID = this.selectedPC_ID;
    this.socket.emit('pcInfoRequest', {
      pcID: pcID,
      authentication_key: authentication_key,
      userID: userID
    });
  }
  getAccessToPC() {
    this.processAlert(true);
    const self = this;
    const headers = self.headers;
    const sendData = {};
    sendData['pcKeyPublic'] = this.publicPcKey;
    sendData['userID'] = sessionStorage.getItem('userID');
    console.log(JSON.stringify(sendData));
    this.http.post(`${config.url}${config.port}/api/v1/computer/public/access`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          console.log(val);
        },
        response => {},
        () => {});
  }
  propertyFunction(e) {
    this.property = e;
  }
  validateFolder(e) {
    const sendData = {};
    const self = this;
    const headers = self.headers;
    sendData['pcKeyPublic'] = self.publicPcKey;
    sendData['userID'] = sessionStorage.getItem('userID');
    sendData['createFolderName'] = self.createFolderName;
    sendData['path'] = self.openFolderPath;
    console.log(JSON.stringify(sendData));
    this.http.post(`${config.url}${config.port}/api/v1/user/computer/validateFolderName`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          console.log(val);
          this.createFolderNameErrorMsg = val.message;
        },
        response => {},
        () => {});
  }

// Request File to Download
  downloadFile(folder){
    //this.processAlert(true);
    const pcKeyPublic = this.publicPcKey;
    const userID = sessionStorage.getItem('userID');
    const authentication_key = sessionStorage.getItem('authentication_key');
    this.socket.emit('downloadFileRequest', {
      path: folder.path,
      authentication_key: authentication_key,
      userID: userID,
      pcKeyPublic: pcKeyPublic
    });
  }


}
