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
    sendData['id'] = sessionStorage.getItem('id');
    console.log(JSON.stringify(sendData));
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    self.http.post(`${config.url}${config.port}/auth`,
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
    self.http.post(`${config.url}${config.port}/myInfo`,
        JSON.stringify(sendData), {
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
    const ioSocketID = sessionStorage.getItem('ioSocketID');
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    self.socket.emit('joinFromWeb', {
      data: {
        id: id,
        auth: auth,
        ioSocketID: ioSocketID
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
    self.http.post(`${config.url}${config.port}/myInfo/myPC/online`,
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
    const ioSocketID = sessionStorage.getItem('ioSocketID');
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    console.log(auth);
    this.folderList = [];
    this.socket.emit('openFolder', {
      path: path + '//',
      auth: auth,
      room: ioSocketID,
      id: id,
      pcKeyPublic: pcKeyPublic
    });
  }
  openFolder(path, fileName) {
    this.processAlert(true);
    const pcKeyPublic = this.publicPcKey;
    this.openFolderName = fileName;
    this.breadcrumb(path);
    console.log(fileName);
    const ioSocketID = sessionStorage.getItem('ioSocketID');
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    console.log(auth);
    this.folderList = [];
    this.socket.emit('openFolder', {
      path: path + '//',
      auth: auth,
      room: ioSocketID,
      id: id,
      pcKeyPublic: pcKeyPublic
    });
  }
  // get file  or  folder  info  add    to  new  variable
  fileOption(info) {
    this.folderInfo = info;
  }


  // logout System
  logout() {
    const data = {};
    data['id'] = sessionStorage.getItem('id');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    this.http.post(`${config.url}${config.port}/logout`,
        JSON.stringify(data), {
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
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    this.socket.emit('pcAccessRequest', {
      pcID: pcID,
      auth: auth,
      userID: id
    });
    this.pcSelect = true;
    this.selectedPC_ID = pcID;
    this.socket.emit('pcInfoRequest', {
      pcID: pcID,
      auth: auth,
      userID: id
    });
  }
  //  get  pc  information   
  pcInfo() {
    this.processAlert(true);
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    const pcID = this.selectedPC_ID;
    this.socket.emit('pcInfoRequest', {
      pcID: pcID,
      auth: auth,
      userID: id
    });
  }
  getAccessToPC() {
    this.processAlert(true);
    const sendData = {};
    sendData['pcKeyPublic'] = this.publicPcKey;
    sendData['id'] = sessionStorage.getItem('id');
    console.log(JSON.stringify(sendData));
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    this.http.post(`${config.url}${config.port}/public/pc/access`,
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
    sendData['pcKeyPublic'] = this.publicPcKey;
    sendData['id'] = sessionStorage.getItem('id');
    sendData['createFolderName'] = this.createFolderName;
    sendData['path'] = this.openFolderPath;
    console.log(JSON.stringify(sendData));
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    this.http.post(`${config.url}${config.port}/validateFolderName`,
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
}