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
  ConnectionService
} from 'ng-connection-service';
import {config} from '../config/config'
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  socket: SocketIOClient.Socket;
  /**
   * All My pc
   */
  pcs: any = [];
  /**
   * User Info
   */
  user: any = [];
  firstName = '';
  lastName = '';
  /**
   *
   * Update user Password
   */
  password = '';
  newPassword = '';
  confirmNewPassword = '';
  // alert
  alert: any = [];
  // test user is online or  offline
  isConnected = true;
  // todo  convert  all  errors  to  one  json object
  error_message = false;
  error_message_text = '';
  error_password = false;
  error_password_text = '';
  // post Header
  headers: any = '';
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
          this.router.navigate(['/login']);
        },
        () => {
          console.log('The POST observable is now completed.');
        });
        self.http.get(`${config.url}${config.port}/api/v1/user/${sendData['userID']}`,
      {
          headers
        })
      .subscribe(
        (val: any) => {
          self.user = val.data;
          console.log(val);
        },
        response => {},
        () => {});
        self.http.post(`${config.url}${config.port}/api/v1/user/computer`,
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
  }
  onUpdate(e) {
    e.preventDefault();
    
    const self = this;
    const headers = self.headers;
    //  alert(this.nameLast);
    // todo  bug found on  system some tim the two variable  get as null  if user did not change
    if (self.firstName === '' || self.lastName === '') {
      self.error_message = true;
      self.error_message_text = 'First name / Last name required';
    } else {
      const sendData = {};
      sendData['lastName'] = self.lastName;
      sendData['firstName'] = self.firstName;
      sendData['userID'] = sessionStorage.getItem('userID');
      self.http.post(`${config.url}${config.port}/api/v1/user/update`,
          JSON.stringify(sendData), {
            headers
          })
        .subscribe(
          (val: any) => {
            window.location.replace('/account');
          },
          response => {
            this.error_message = true;
            this.error_message_text = response.error.message;
          },
          () => {
            //  console.log("The POST observable is now completed.");
          });
    }
  }
  onUpdatePassword(e) {
    e.preventDefault();

    const self = this;
    const headers = self.headers;

    const sendData = {};
    sendData['password'] = self.password;
    sendData['newPassword'] = self.newPassword;
    sendData['confirmNewPassword'] = self.confirmNewPassword;
    sendData['userID'] = sessionStorage.getItem('userID');
    self.http.post(`${config.url}${config.port}/api/v1/user/password/edit`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          window.location.replace('/account');
        },
        response => {
          this.error_password = true;
          this.error_password_text = response.error.message;
        },
        () => {
          //  console.log("The POST observable is now completed.");
        });
  }
  
  allowPublic(id, index, e) {
    let status = 0;
    const self = this;
    if (e.target.checked) {
      console.log(id);
      //
      status = 1;
    } else {
      status = 0;
    }
    const sendData = {};
    sendData['userID'] = sessionStorage.getItem('userID');
    sendData['computerKey'] = id;
    sendData['status'] = status;
    console.log(JSON.stringify(sendData));
    const headers = self.headers;
    self.http.post(`${config.url}${config.port}/api/v1/user/computer/public/status/update`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          self.pcs[index].publicAccessKey = val.data.publicAccessKey;
          self.pcs[index].publicAccessStatus = status;
        },
        response => {},
        () => {});
  }
  logout() {
    const userID =   sessionStorage.getItem('userID');
    const self = this;
    const headers = self.headers;
    self.http.get(`${config.url}${config.port}/api/v1/user/${userID}/logout`,
         {
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
}