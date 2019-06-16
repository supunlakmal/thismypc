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
import {config} from '../config/config'
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
  // path that need to copy
  copyPath = '';
  // copy File name
  copyFileName = '';
  // path that need to  paste
  pastePath = '';
  // copy state active
  copyFile = false;
  // paste state active
  pasteFile = false;
  // open folder or hhd path (name)
  openFolderName = '';
  // open folder or hhd path
  openFolderPath = '';
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
selectedPC_ID ='';


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
    this.socket = io.connect(`${config.url}${config.port}`);
    const self = this;
    this.connectionService.monitor().subscribe(isConnected => {
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
  processAlert(e) {
    const self = this;
    self.alert.openAlert = e;
    self.alert.class = 'alert-primary';
    self.alert.massage = ` <i class="fas fa-sync-alt fa-spin"></i> <strong>Progress... </strong> `;
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
    this.http.post(`${config.url}${config.port}/auth`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {},
        response => {
          // if offline
          this.router.navigate(['/login']);
        },
        () => {
          console.log('The POST observable is now completed.');
        });
    this.http.post(`${config.url}${config.port}/myInfo`,
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
    this.socket.emit('joinFromWeb', {
      data: {
        id: id,
        auth: auth,
        ioSocketID: ioSocketID
      }
    });
    const mainThis = this;
    this.socket.on('hDDList', function (data) {
      mainThis.hDDList = data;
      console.log(data.parts);
      self.processAlert(false);
    });
    this.socket.on('openFolderRequestToWeb', function (data) {
      self.processAlert(false);
      console.log(data, 'openlist');
      mainThis.folderList.push(data);
    });
    this.socket.on('pasteDone', function (data) {
      mainThis.alert.openAlert = true;
      mainThis.alert.class = 'alert-success';
      mainThis.alert.massage = ` <strong> Paste Done </strong> `;
    });
    this.http.post(`${config.url}${config.port}/myInfo/myPC/online`,
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
    this.socket.on('folderCreateCallbackToWeb', function (data) {
      mainThis.alert.openAlert = true;
      if (data.status) {
        mainThis.alert.class = 'alert-success';
        mainThis.alert.massage = ` <strong> ${data.message} </strong> `;
      } else {
        mainThis.alert.class = 'alert-danger';
        mainThis.alert.massage = ` <strong> ${data.message}  </strong> `;
      }
    });
  //  pcInfoRequest
  this.socket.on('pcInfo', function (data) {

    self.pcInfoData = data;
    console.log(data);

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
    this.openFolderPath = path;
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
    this.openFolderPath = path;
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
  /// click on  copy  option
  //  todo  on copy alert  dismiss   need fails  bake copyFile
  // todo  need to  right  copy and paste  functions
  clickCopy(info) {
    this.alert.openAlert = true;
    this.alert.class = 'alert-warning';
    this.alert.massage = `<strong>Pending Copy</strong> `;
    this.copyPath = info.path;
    this.copyFile = true;
    this.pasteFile = false;
    this.copyFileName = info.fileName;
  }
  clickPaste(info) {
    this.alert.openAlert = true;
    this.alert.class = 'alert-primary';
    this.alert.massage = ` <i class="fas fa-sync-alt fa-spin"></i> <strong> Paste in Progress </strong> `;
    this.pastePath = info.path + '/' + this.copyFileName;
    this.copyFile = false;
    this.pasteFile = true;
    const id = sessionStorage.getItem('id');
    const auth = sessionStorage.getItem('auth');
    /**
     * Get  copy file and paste  file  location and send to pc side
     * it will copy
     */
    // TODO  only files can be copy this is a bug need to fixed
    const send = {
      copyPathSet: this.copyPath,
      pastePathSet: this.pastePath
    };
    // TODO whyyyyyy this happen  need to find
    //     send.copyPathSet =this.copyPath; //errorr
    //     send.pastePathSet =this.pastePath; //errorr
    //   let send ={ }
    this.socket.emit('copyPasteToPC', {
      data: send,
      auth: auth,
      id: id
    });
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

    this.pcSelect =true;
    this.selectedPC_ID =pcID;

    this.socket.emit('pcInfoRequest', {
      pcID: pcID,
      auth: auth,
      userID: id
    });


  }


//  get  pc  information   

pcInfo(){

  const id = sessionStorage.getItem('id');
  const auth = sessionStorage.getItem('auth');
  const  pcID  =  this.selectedPC_ID;
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
  downloadFileRequest(path) {
    const sendData = {};
    sendData['pcKeyPublic'] = this.publicPcKey;
    sendData['id'] = sessionStorage.getItem('id');
    sendData['path'] = path;
    console.log(JSON.stringify(sendData));
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    this.http.post(`${config.url}${config.port}/pc/downloadFileRequest`,
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