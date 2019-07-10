import {
  Component,
  OnInit
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  Router,
  RouterModule,
  Routes
} from '@angular/router';

import {config} from '../config/config'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  password = '';
  email = '';
  name = '';
  fullName = '';
  email_contribute = '';
  error_message = false;
  error_message_text = '';
  error_message_contribute = false;
  message_contribute_done = false;
  error_message_contribute_text = '';
  userCount = '';
  pcCount = '';
  contribute_alert_show = true;
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() {

    console.log('%c My code DOESN’T work, I have no idea why. My code WORKS, I have no idea why! ', 'font-size: 20px; background: #0080ff; color: #fff');
    const self = this;
  }
  resetModel() {
    this.error_message = false;
  }
  contribute_alert_close() {
    this.contribute_alert_show = false;
  }
  onSubmit(e) {
    e.preventDefault();
    if (this.email === '' || this.password === '') {
      this.error_message = true;
      this.error_message_text = 'username/password required';
    } else {
      const sendData = {};
      sendData['email'] = this.email;
      sendData['password'] = this.password;
      //  console.log(JSON.stringify(sendData));
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');
      this.http.post(`${config.url}${config.port}/user/web/login`,
          JSON.stringify(sendData), {
            headers
          })
        .subscribe(
          (val: any) => {
            sessionStorage.setItem('name', val.data.name);
            sessionStorage.setItem('auth', val.data.auth);
            sessionStorage.setItem('id', val.data.id);
            sessionStorage.setItem('ioSocketID', val.data.ioSocketID);
            //   this.router.navigate(['/system']); //  redirect  to  system
            window.location.replace('/system');
          },
          response => {
            this.error_message = true;
            this.error_message_text = response.error.message;
            //  console.log("POST call in error", response);
          },
          () => {
            //  console.log("The POST observable is now completed.");
          });
    }
  }
  onRegister(e) {
    e.preventDefault();
    if (this.email === '' || this.password === '' || this.name === '') {
      this.error_message = true;
      this.error_message_text = 'username/password/name required';
    } else {
      const sendData = {};
      sendData['email'] = this.email;
      sendData['password'] = this.password;
      sendData['name'] = this.name;
      /// console.log(JSON.stringify(sendData));
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');
      this.http.post(`${config.url}${config.port}/register`,
          JSON.stringify(sendData), {
            headers
          })
        .subscribe(
          (val: any) => {
            sessionStorage.setItem('name', val.data.name);
            sessionStorage.setItem('auth', val.data.auth);
            sessionStorage.setItem('id', val.data.id);
            sessionStorage.setItem('ioSocketID', val.data.ioSocketID);
            //   this.router.navigate(['/system']); //  redirect  to  system
            window.location.replace('/system');
          },
          response => {
            this.error_message = true;
            this.error_message_text = response.error.message;
            //  console.log("POST call in error", response);
          },
          () => {
            //  console.log("The POST observable is now completed.");
          });
    }
  }
  
}