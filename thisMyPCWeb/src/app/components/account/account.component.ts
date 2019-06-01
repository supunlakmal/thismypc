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
  name = '';
  nameLast = '';
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
  error_passowrd = false;
  error_passowrd_text = '';
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
    sendData['id'] = sessionStorage.getItem('id');
    console.log(JSON.stringify(sendData));
    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
    const headers = this.headers;
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
    this.http.post(`${config.url}${config.port}/myInfo/myPC`,
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
    const headers = this.headers;
    //  alert(this.nameLast);
    // todo  bug found on  system some tim the two variable  get as null  if user did not change
    if (this.nameLast === '' || this.name === '') {
      this.error_message = true;
      this.error_message_text = 'First name / Last name required';
    } else {
      const sendData = {};
      sendData['nameLast'] = this.nameLast;
      sendData['name'] = this.name;
      sendData['id'] = sessionStorage.getItem('id');
      /// console.log(JSON.stringify(sendData));
      /*const headers = new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');*/
      this.http.post(`${config.url}${config.port}/account/myInfo/update`,
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
    const headers = this.headers;
    /*        if (this.nameLast === '' || this.name === '') {
                this.error_message = true;
                this.error_message_text = 'First name / Last name required';
            } else {*/
    const sendData = {};
    sendData['password'] = this.password;
    sendData['newPassword'] = this.newPassword;
    sendData['confirmNewPassword'] = this.confirmNewPassword;
    sendData['id'] = sessionStorage.getItem('id');
    /// console.log(JSON.stringify(sendData));
    /*        const headers = new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');*/
    this.http.post(`${config.url}${config.port}/account/password/update`,
        JSON.stringify(sendData), {
          headers
        })
      .subscribe(
        (val: any) => {
          window.location.replace('/account');
        },
        response => {
          this.error_passowrd = true;
          this.error_passowrd_text = response.error.message;
        },
        () => {
          //  console.log("The POST observable is now completed.");
        });
  }
  /*}*/
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
    sendData['id'] = sessionStorage.getItem('id');
    sendData['pcID'] = id;
    sendData['status'] = status;
    console.log(JSON.stringify(sendData));
    const headers = this.headers;
    this.http.post(`${config.url}${config.port}/myInfo/myPc/update`,
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
}