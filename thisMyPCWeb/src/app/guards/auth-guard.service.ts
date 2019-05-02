import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route} from '@angular/router';
import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router , private http: HttpClient) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        const sendData = {};
        sendData['id'] = sessionStorage.getItem('id');
        console.log(JSON.stringify(sendData));
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('token', sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : 'thismyPc');
        this.http.post('http://thismypc.com:5000/auth',
            JSON.stringify(sendData), {
                headers
            })
            .subscribe(
                (val: any) => {
                },
                response => {
                    // if offline
          this.router.navigate(['/login']);
                },
                () => {
                    console.log('The POST observable is now completed.');
                });




        //  if (this._authService.isAuthenticated()) {
        return true;
        // }

        // navigate to login page
        //  this._router.navigate(['/login']);
        // you can save redirect url so after authing we can move them back to the page they requested
        // return false;
    }

}
