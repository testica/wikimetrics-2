import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../environments/environment';
import { ISignIn } from './resource';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private router: Router
  ) {}

  get token() {
    return window.localStorage.getItem('auth_token');
  }

  isSigned() {
    return !!this.token;
  }

  get authHeader() {
    return new Headers({'Authorization': `Bearer ${this.token}`});
  }

  signIn(username: string, password: string) {
    return this.http.post(`${environment.API_URL}/sign-in`, {username, password})
                    .toPromise()
                    .then(res => {
                      const obj: ISignIn = res.json();
                      // store token
                      window.localStorage.setItem('auth_token', obj.access_token);
                      return obj;
                    });
  }

  signUp(username: string, password: string) {
    return this.http.post(`${environment.API_URL}/sign-up`, {username, password})
                    .toPromise()
                    .then(res => {
                      const obj: ISignIn = res.json();
                      // store token
                      window.localStorage.setItem('auth_token', obj.access_token);
                      return obj;
                    });
  }

  signOut() {
    window.localStorage.removeItem('auth_token');
    this.router.navigate(['/sign-in']);
  }

}
