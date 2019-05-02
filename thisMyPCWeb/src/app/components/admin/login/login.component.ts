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

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(private http: HttpClient, private router: Router) {
    }

    ngOnInit() {
    }


}
