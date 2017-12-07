import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private authSvc: AuthService,
    private router: Router) {}

  canActivate() {
    if (!this.authSvc.isSigned()) {
      this.router.navigate(['/sign-in']);
    }

    return this.authSvc.isSigned();
  }
}
