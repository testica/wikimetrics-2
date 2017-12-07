import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../environments/environment';
import { ISignIn } from './resource';

@Injectable()
export class AuthService {

  private loggedIn = false;

  constructor(private http: Http) {
    this.loggedIn = !!window.localStorage.getItem('auth_token');
  }

  get token() {
    return window.localStorage.getItem('auth_token');
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

}
