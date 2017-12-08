import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs/Subscription';
import { NavbarService, DEFAULT_CONFIG } from '../navbar/navbar.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  // form control
  usernameFormControl = new FormControl('', [Validators.required]);
  passwordGroupControl = this.fb.group({
    password: ['', [Validators.required]],
    repassword: ['', [Validators.required, this.matchFieldValidator('password')]]
  });

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private navbarSvc: NavbarService
  ) {
    this.navbarSvc.config$.next(DEFAULT_CONFIG);
  }

  get invalidUsername() {
    return this.usernameFormControl.hasError('required');
  }

  get invalidPassword() {
    return this.passwordGroupControl.controls.password.hasError('required');
  }

  get invalidRepassword() {
    return this.passwordGroupControl.controls.repassword.hasError('required') ||
           this.passwordGroupControl.controls.repassword.hasError('notSame');
  }

// Custom validator to ensure that password and repassword be equal
  matchFieldValidator(fieldToMatch: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any; } => {
      const confirmField = control.root.get(fieldToMatch);

      if (confirmField) {
        const subscription: Subscription = confirmField
            .valueChanges
            .subscribe(() => {
                control.updateValueAndValidity();
                subscription.unsubscribe();
            });
    }
      return (confirmField && control.value === confirmField.value) ? { } : { notSame: true };
    };
  }

  signUp() {
    this.authSvc.signUp(
      this.usernameFormControl.value,
      this.passwordGroupControl.value.password)
    .then(() => this.router.navigate(['']))
    .catch((reason) => console.log(reason.status));
  }

}
