import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { NavbarService, DEFAULT_CONFIG } from '../navbar/navbar.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  user: {username: string, password: string} = {username: '', password: ''};

  // form control
  usernameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private navbarSvc: NavbarService
  ) {
    this.navbarSvc.config$.next(DEFAULT_CONFIG);
  }

  signIn() {
    this.authSvc.signIn(this.user.username, this.user.password)
    .then(() => this.router.navigate(['']));
  }

  get invalidUsername() {
    return this.usernameFormControl.hasError('required');
  }

  get invalidPassword() {
    return this.passwordFormControl.hasError('required');
  }

}
